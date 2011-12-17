#!/bin/sh

while read line 
do
	git add -f $line
done < shell/devel/devel/files.txt

git status