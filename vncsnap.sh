#!/bin/bash

HOSTLIST="bd01 bd02 bd03 bd04 bd05 am01 am02 am04 am05 am06"

#HOSTNAME=`hostname`
STOP="/nfs/nfs/imgstream/stop.jpg"
imgpath="/nfs/nfs/imgstream/images"
LOGFILE="/nfs/nfs/imgstream/snap.log"
LOGDATE="date +%Y.%m.%d-%H:%M:%S"

for HOSTNAME in $HOSTLIST;
do
  echo "`${LOGDATE}` - Connect to $HOSTNAME" >> $LOGFILE 2>&1;
  vlist=`ssh $HOSTNAME virsh list --state-running | grep $HOSTNAME | awk '{print $2}'`

  for VM in $vlist;
  do
    vmid=${VM:5:4}
    port=$((10#$vmid+34100))
    portreal=$((10#$vmid+40000))
    echo "Create snapshot for running $VM, vnc port: $port, real port: $portreal" >> $LOGFILE 2>&1;
    vncsnapshot -allowblank -vncQuality 4 -quality 30 $HOSTNAME:$port $imgpath/$VM.jpg >> /dev/null 2>&1;
  done

  vlistoff=`ssh $HOSTNAME virsh list --state-shutoff | grep $HOSTNAME | awk '{print $2}'`
  for VM in $vlistoff;
  do
    echo "Create snapshot for stopped $VM" >> $LOGFILE 2>&1;
    cp $STOP $imgpath/$VM.jpg
  done
done

