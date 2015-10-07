Setting up the EV3
====================

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