setting up usb rs485 convertor:
offical driver from http://www.wch.cn/download/CH341SER_MAC_ZIP.html crashes with Mac Sierra, use:
https://forums.developer.apple.com/thread/61472
http://www.mblock.cc/posts/run-makeblock-ch340-ch341-on-mac-os-sierra



1. Use a beta version of driver that doesn't crash Mac.
http://www.mblock.cc/posts/run-makeblock-ch340-ch341-on-mac-os-sierra

2. verify /dev/tty.wchusbserial1420 exist after plug in the convertor

3. In processing, the script lists all available serial port, in my computer, here is what's printed out:
/dev/cu.Bluetooth-Incoming-Port 
/dev/cu.Muse-7D3D-RN-iAP 
/dev/cu.SLAB_USBtoUART 
/dev/cu.wchusbserial1420 
/dev/tty.Bluetooth-Incoming-Port 
/dev/tty.Muse-7D3D-RN-iAP
 /dev/tty.SLAB_USBtoUART 
/dev/tty.wchusbserial1420

We need to use SLAB_USBtoUART to talk to nodeMCU. In my case, it's either:
2 => /dev/cu.SLAB_USBtoUART
or 
6 => /dev/tty.SLAB_USBtoUART

In line:
port = new Serial(this, Serial.list()[p0], 9600); 

set p0 to either 2 or 6 will work for me.

On nodeMcu side, I use RXD0 and TXD0 (3rd and 4th connector from usb port).


