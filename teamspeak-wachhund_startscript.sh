#!/bin/sh

# Any copyright is dedicated to the Public Domain.
# http://creativecommons.org/publicdomain/zero/1.0/

# teamspeak-wachhund Startscript
SCRIPTPATH="$(dirname "${0}")"
cd "${SCRIPTPATH}"

SCRIPTNAME="wachhund.js"
if [ ! -e $SCRIPTNAME ]; then
	echo "Could not locate JS-File, aborting"
	exit 5
fi

case "$1" in
	start)
		if [ -e wachhund.pid ]; then
			if ( kill -0 $(cat wachhund.pid) 2> /dev/null ); then
				echo "Wachhund for Teamspeak 3 is already running, try restart or stop"
				exit 1
			else
				echo "wachhund.pid found, but no dog is barking. Possibly your previously dog died"
				echo "Please view the logfile for details."
				rm wachhund.pid
			fi
		fi
		if [ "${UID}" = "0" ]; then
			echo "WARNING ! For security reasons we advise: DO NOT RUN WACHHUND AS ROOT"
			c=1
			while [ "$c" -le 10 ]; do
				echo -n "!"
				sleep 1
				c=$((++c))
			done
			echo "!"
		fi
		echo "Starting Wachhund for Teamspeak 3"
		if [ -e "$SCRIPTNAME" ]; then
                        if [ ! -x "$SCRIPTNAME" ]; then
                                echo "${SCRIPTNAME} is not executable, trying to set it"
                                chmod u+x "${SCRIPTNAME}"
                        fi
                        if [ -x "$SCRIPTNAME" ]; then
                                line="-------------$(date +'%D %T')-------------";
                                echo $line >> error.log
                                "./${SCRIPTNAME}" >> /dev/null 2>>error.log &
                                echo $! > wachhund.pid
                                echo "Wachhund for Teamspeak 3 started"
                        else
                                echo "${SCRIPTNAME} is not exectuable, cannot start Wachhund for Teamspeak 3"
                        fi
		else
			echo "Could not find JS-File, aborting"
			exit 5
		fi
	;;
	stop)
		if [ -e wachhund.pid ]; then
			echo -n "Stopping Wachhund for Teamspeak 3 "
			if ( kill -TERM $(cat wachhund.pid) 2> /dev/null ); then
				c=1
				while [ "$c" -le 300 ]; do
					if ( kill -0 $(cat wachhund.pid) 2> /dev/null ); then
						echo -n "."
						sleep 1
					else
						break
					fi
					c=$((++c)) 
				done
			fi
			if ( kill -0 $(cat wachhund.pid) 2> /dev/null ); then
				echo "Wachhund for Teamspeak 3 is not shutting down cleanly - killing"
				kill -KILL $(cat wachhund.pid)
			else
				echo "done"
			fi
			rm wachhund.pid
		else
			echo "No dog is barking (wachhund.pid is missing)"
			exit 7
		fi
	;;
	restart)
		$0 stop && $0 start || exit 1
	;;
	status)
		if [ -e wachhund.pid ]; then
			if ( kill -0 $(cat tsdnsserver.pid) 2> /dev/null ); then
				echo "Wachhund for Teamspeak 3 is running"
			else
				echo "Wachhund for Teamspeak 3 seems to have died"
			fi
		else
			echo "No Wachhund for Teamspeak 3 running (wachhund.pid is missing)"
		fi
	;;
	*)
		echo "Usage: ${0} {start|stop|restart|status}"
		exit 2
esac
exit 0

