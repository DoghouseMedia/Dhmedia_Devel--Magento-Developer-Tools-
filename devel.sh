#!/bin/sh

#
# Vars: handler and command
#

DEVEL_SH_HANDLER=$1
DEVEL_SH_COMMAND=$2

if [ ! -n "$DEVEL_SH_HANDLER" ]
then
	echo "Enter handler:"
	read DEVEL_SH_HANDLER
fi

if [ ! -n "$DEVEL_SH_COMMAND" ]
then
	echo "Enter command:"
	read DEVEL_SH_COMMAND
fi

#
# Path
#
DEVEL_SH_PATH="./shell/devel/$DEVEL_SH_HANDLER/$DEVEL_SH_COMMAND.sh"
DEVEL_PHP_PATH="./shell/devel/$DEVEL_SH_HANDLER/$DEVEL_SH_COMMAND.php"

if [ -f $DEVEL_SH_PATH ]
then
	#
	# Source the include to use current shell
	#
	. $DEVEL_SH_PATH; exit
fi

if [ -f $DEVEL_PHP_PATH ]
then
	php $DEVEL_PHP_PATH; exit
fi

#
# ERROR
#
echo "ERROR: Handler or command doesn't exist! ($DEVEL_SH_PATH)"
exit
