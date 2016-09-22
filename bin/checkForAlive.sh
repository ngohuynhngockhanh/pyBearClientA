#!/bin/bash 


DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
echo $DIR
process="bear.js"

#insmod sha1_generic
while true;
do
	if ps | grep -v grep | grep $process > /dev/null         
	then                 
		echo "Process $process is running"         
	else        
		echo "Start bear again"
		cd $DIR && cd ../ && node bear.js 
	fi
	sleep 10
done