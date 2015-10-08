Setting up the EV3
====================

Project for running the lead instrument of hitmachine on a LEGO Mindstorms EV3 (running ev3dev)

# Getting started

1. Follow getting started guide here: http://www.ev3dev.org/docs/getting-started/ (remember to set up the user)
2. FTP into the device using root user (host=sftp://DEVICE_IP, user=root, password=r00tme)
3. Copy project including node_modules (but not starters) into /home/instrument on EV3 device
4. Copy files in `starters` to /home
5. SSH into device `ssh root@DEVICE_IP`
6. Make starter files executable `chmod -x LEAD1.sh LEAD2.sh LEAD3.sh LEAD4.sh LEAD5.sh LEAD6.sh LEAD7.sh LEAD8.sh`
7. Change file owner
    - chown -R user:user /home/instrument
    - chown user:user LEAD1.sh LEAD2.sh LEAD3.sh LEAD4.sh LEAD5.sh LEAD6.sh LEAD7.sh LEAD8.sh;
8. Reboot device

> REMEMBER! Before starting the script a sensor MUST have been previously plugged into the device

# Free up memory
To free up memory on the EV3, we need to disable some unneeded services

Avahi Daemon
$ update-rc.d -f avahi-daemon remove
$ update-rc.d avahi-daemon defaults
$ rm etc/init.d/avahi-daemon
$ rm etc/default/avahi-deamon

Systemd journal
$ systemctl mask systemd-journald.service

nmbd
$ rm /etc/init/nmbd.conf
$ rm /etc/init.d/nmbd


### Determine memory usage
ps -p $PID -o rss,vsz

> Get top 10 process by memory usage: ps aux --sort -rss | head

> Watch memory usage in real time: top -pid $PID