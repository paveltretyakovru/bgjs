var Bones = function(selector){
    this.selector = $(selector);
};

Bones.prototype.bone1       = 0;
Bones.prototype.bone2       = 0;
Bones.prototype.size       = 40;
Bones.prototype.selector    = {};
Bones.prototype.timeAnim    = 1000;
Bones.prototype.number      = 1;

Bones.prototype.selectGlyph = function (number){
    var x, y;
    switch (number){
      default:
      case 1: x = 0;            y =  0;          break;
      case 2: x = 2*this.size;  y =  0;          break;
      case 3: x = this.size;    y =  0;          break;
      case 4: x = this.size;    y = this.size;   break;
      case 5: x = 2*this.size;  y = this.size;   break;
      case 6: x = 0;            y = this.size;   break;
    }
    this.selector.css('backgroundPosition', x+'px '+y+'px');
};

Bones.prototype.shake = function(){
    console.log('shake :-)');
    
    var obj = this;
    
    $.when($.Deferred(function(dfd){
        var z = obj.selector.css('z-index');

        obj.selector.css('z-index', 1).animate(
            { 'z-index': obj.timeAnim } ,
            {
                step    : function(now, fx){
                    obj.selectGlyph(Math.floor(Math.random() * 6) + 1);
                } ,
                
                duration: obj.timeAnim ,
                
                complete: dfd.resolve
            }).css('z-index', z);

        return dfd.promise();
    })).done(function() {
        
        obj.number = (Math.floor(Math.random() * 6) + 1);
        
        $(this).stop();
        
        obj.selectGlyph(obj.number);

        /*
            if (options.callback
                && typeof(options.callback) === "function")
            options.callback(options.number);
        */
    });
};