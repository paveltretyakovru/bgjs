var Socket = function(){
    this.connection = io.connect(this.connecturl);
};

Socket.prototype.connecturl = 'https://bgjs-c9-ptretyakov.c9.io/';
Socket.prototype.connection = {};