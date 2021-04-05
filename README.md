# disney-checker

uses a very basic node server and a JSON based Database to check Disney park avalability. 
It is only meant for personal use and can only notify a hard coded ifttt webhook.


in order to use ifttt webhooks notifications you need to create a file called keys.js at the root project level and it should contain 

```
const IFTTTKEY = "[YOUR_IFTTT_KEY_HERE]";

module.exports = {IFTTTKEY};
```

This was done so I wouldn't accedently add my personal key to git hub :P 
