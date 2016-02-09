#!/usr/bin/env bash

cp asoundrc ~/.asoundrc
sudo alsactl init 1
forever start server.js
/usr/bin/chromium-browser --noerrdialogs --kiosk http://localhost:5000
