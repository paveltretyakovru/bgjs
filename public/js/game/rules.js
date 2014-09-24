var Rules = function(){};

Rules.prototype.steps   = {};
Rules.prototype.fields  = [];

/* Сохраняем поля  */
Rules.prototype.setFields = function(fields){this.fields = fields;};
/* Сохраняем таблицу ходов */
Rules.prototype.setSteps = function(steps){this.steps = steps;};

Rules.prototype.canMove = function ( oldfield , newfield ) {
    
    // если новое поле не указано, значит необходио проверить может ли оно
    // вообще сходит куда-нибудь
    if(newfield === 0){
        
    }
};