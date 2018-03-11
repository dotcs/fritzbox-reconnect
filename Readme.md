# Fritz!Box Reconnect

Simple script that checks whether a Fritz!Box router is online.
Does restart the Fritz!Box in case no ipv4 or ipv6 connection is established.
It requires [node.js](https://nodejs.org/en/) (>= v.8.0.0) to be installed.

```bash
# Start script
FB_PW=my_secret_fritzbox_password yarn run check
```

The following environment variables are available.
Required variables must be set by the user.

* `FB_PW`: (required) Password to log into the Fritz!Box webinterface.
* `FB_IP`: (optional) IP of the Fritz!Box router. Defaults to `192.168.178.1`.
* `FB_COOLDOWN_MIN`: (optional) Time (in minutes) that should be waited
  for the Fritz!Box to get online before it is restarted (again).
  Defaults to 3 minutes.

## Logfiles

Logs are created to log what has been done by the script.
The file `log/all.log` is created, new entries are attached.

Sample log file:

```
# combinded.log
2018-03-11T13:36:59.576Z [Fritz!Box Reconnector] info: Fritz!Box is offline. Try to restart.
2018-03-11T13:37:02.426Z [Fritz!Box Reconnector] info: Restart now
2018-03-11T13:39:03.709Z [Fritz!Box Reconnector] info: Cooldown is active. Nothing to do.
```
