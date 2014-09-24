var Rules = function(){};

Rules.prototype.steps   = {};
Rules.prototype.fields  = [];

// необходимые функции для проверки возможности хода
Rules.prototype.rules = [
        'haveEnemy' // проверка на содержание фишек противника на поле
    ];

/* Сохраняем поля  */
Rules.prototype.setFields = function(fields){this.fields = fields;};
/* Сохраняем таблицу ходов */
Rules.prototype.setSteps = function(steps){this.steps = steps;};

Rules.prototype.haveEnemy = function(){
    console.log('haveEnemy function :-)');
};

Rules.prototype.handleRules = function(oldfield , newfield){
    for(var i = 0; i < this.rules.length; i++){
        this[this.rules[i]](oldfield , newfield);
    }
};

Rules.prototype.getNewfields = function(){
    
};

Rules.prototype.canMove = function ( oldfield , newfield ) {
    // если новое поле не указано, значит необходио проверить может ли оно
    // вообще сходит куда-нибудь
    if(newfield === 0){
        
    }
};