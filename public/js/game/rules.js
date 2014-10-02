var Rules = function(){};

Rules.prototype.step    = {};
Rules.prototype.fields  = [];

// необходимые функции для проверки возможности хода
Rules.prototype.rules = [
        'haveEnemy' // проверка на содержание фишек противника на поле
    ];

/* Сохраняем поля  */
Rules.prototype.setFields = function(fields){this.fields = fields;};
/* Сохраняем таблицу ходов */
Rules.prototype.setSteps = function(step){this.step = step;};

Rules.prototype.addSendStep = function(data){
    var pieceid     = data[0];
    var newfield    = data[1];
    
    this.step.send.push(
            {
                pieceid     : pieceid ,
                newfield    : newfield ,
                steps       : this.step.steps.slice()
            }
        );
};

/*
    # Правило имеет ли поле фишки соперника
*/

Rules.prototype.haveEnemy = function(){
    return true;
};

/*
    # Функция перебирает правила хода и проверяет может ли сходить
*/
Rules.prototype.handleRules = function(oldfield , newfield){
    var ruleresult = true;
    for(var i = 0; i < this.rules.length; i++){
        ruleresult = this[this.rules[i]](newfield);
        
        if(!ruleresult){return false;}
    }
    
    return ruleresult;
};

Rules.prototype.calcMove = function(oldfield , newfield , pieceid , clickboard){
    var result = oldfield;
    
    console.log('newfield: ' , newfield);
    
    /*
        # Игрок передвигает фишку назад
    */
    if(newfield < oldfield){
        for(var i = 0; i < this.step.steps.length; i++){
            // ищем в истории поле с которого передвинута фишка
            if(this.step.steps[i][1] === oldfield){
                // проверяем ходит ли той же фишкой
                if(this.step.steps[i][3] === pieceid){
                    result = this.step.steps[i][2];
                    
                    // стираем значение текущей ичейки очка
                    this.step.steps[i][1] = 0;
                    this.step.steps[i][2] = 0;
                    this.step.steps[i][3] = 0;
                    
                    this.addSendStep([pieceid , result]);
                    
                    // если найдено в истории, возвращаем значение предыдущего хода
                    // этой фишки
                    return result;
                }
            }
        }
    }
    
    /*
        # Классическое высчитывание кода
    */
    if(this.step.steps.length === 2){
        var can1        = false;
        var can2        = false;
        var can3        = false;
        var can4        = false;
        var stepover    = false;
        
        if(this.step.steps[0][1] === 0){
            
            result = this.handleRules(oldfield , this.step.steps[0][0] + oldfield);
            if(result){
                can1 = this.step.steps[0][0] + oldfield;
            }
        }
        
        if(this.step.steps[1][1] === 0){
            /* Делаем перешаг на вторую кость, если это возможно */
            if(this.step.steps[0][1] !== 0){
                
                if(this.step.steps[0][3] === pieceid){
                    result = this.handleRules(this.step.steps[0][2] , this.step.steps[1][0] + this.step.steps[0][2]);
                    
                    if(result){
                        can2        = this.step.steps[1][0] + this.step.steps[0][2];
                        stepover    = true;
                    }
                }else{
                    /*
                        # Либо делаем ход на вторую кость классически :-)
                    */
                    result = this.handleRules(oldfield , this.step.steps[1][0] + oldfield);
                    if(result){
                        can2 = this.step.steps[1][0] + oldfield;
                    }
                }
            }else{
                /*
                    # Либо делаем ход на вторую кость классически :-)
                */
                result = this.handleRules(oldfield , this.step.steps[1][0] + oldfield);
                if(result){
                    can2 = this.step.steps[1][0] + oldfield;
                }
            }
        }
        
        if(this.step.steps[1][1] === 0 && this.step.steps[0][1] === 0){
            result = this.handleRules(
                    oldfield , this.step.steps[0][0] + this.step.steps[1][0] + oldfield
                );
                
            if(result){
                can3 = this.step.steps[0][0] + this.step.steps[1][0] + oldfield;
            }
        }
        
        // условие, что игрок после первого хода хочет сходить на сумму очков
        if(
            this.step.steps[0][1] !== 0 &&
            this.step.steps[1][1] === 0 &&
            this.step.steps[0][3] === pieceid &&
            newfield !== this.step.steps[0][2] + this.step.steps[1][0]){
            result = this.handleRules(
                    oldfield , this.step.steps[0][1] + this.step.steps[1][0]
                );
            
            if(result){
                can4 = this.step.steps[0][1] + this.step.steps[1][0];
            }
        }
        
        // если новое поле является возможным то перетаскиваем на него
        if(can1 === newfield){
            this.step.steps[0][1] = newfield;
            this.step.steps[0][2] = oldfield;    // сохраняем предыдущиее поле
            this.step.steps[0][3] = pieceid;     // сохраняем идентификатор фихи
            
            this.addSendStep([pieceid , can1]);
            
            return can1;
        }
        if(
            can2 === newfield && 
            this.step.steps[0][3] === pieceid &&
            newfield !== this.step.steps[0][2] + this.step.steps[1][0]
            ){
                this.step.steps[1][1] = newfield;
                this.step.steps[1][2] = oldfield;    // сохраняем предыдущее поле
                this.step.steps[1][3] = pieceid;     // сохраняем идентификатор фихи
                
                this.addSendStep([pieceid , can2]);
                
                return can2;
        }
        if(can3 === newfield) {
            this.step.steps[0][1] = newfield;
            this.step.steps[1][1] = newfield;
            
            // сохраняем предыдущее поле
            this.step.steps[0][2] = oldfield; 
            this.step.steps[1][2] = oldfield;
            
            // сохраняем идентификатор фихи
            this.step.steps[0][3] = pieceid;
            this.step.steps[1][3] = pieceid;
            
            this.addSendStep([pieceid , can3]);
            
            return can3;
        }
        
        if(can4 === newfield) {
            this.step.steps[1][1] = newfield;
            this.step.steps[1][2] = oldfield;
            this.step.steps[1][3] = pieceid;
            
            this.addSendStep([pieceid , can4]);
            
            return can4;
        }
        
        // если к функции идет обращение через клик на доску
        if(clickboard !== undefined) return false;
        
        // иначе ходим минамально возможным либо суммой
        if(can1) {
            this.step.steps[0][1] = can1;
            this.step.steps[0][2] = oldfield; // сохраняем предыдущиее поле
            this.step.steps[0][3] = pieceid;     // сохраняем идентификатор фихи
            
            this.addSendStep([pieceid , can1]);
            
            return can1
        };
        if(can2) {
            this.step.steps[1][1] = can2;
            this.step.steps[1][2] = oldfield; // сохраняем предыдущиее поле
            this.step.steps[1][3] = pieceid;     // сохраняем идентификатор фихи
            
            // если сделан перешаг
            if(stepover){
                
                this.step.steps[1][2] = this.step.steps[0][2];
                
                this.step.steps[0][1] = 0;
                this.step.steps[0][2] = 0;
                this.step.steps[0][3] = 0;
            }
            
            this.addSendStep([pieceid , can2]);
            
            return can2;
        };
        if(can3) {
            this.step.steps[0][1] = can3;
            this.step.steps[1][1] = can3;
            
            this.step.steps[0][2] = oldfield; // сохраняем предыдущиее поле
            this.step.steps[1][2] = oldfield;
            
            this.step.steps[0][3] = pieceid;     // сохраняем идентификатор фихи
            this.step.steps[1][3] = pieceid;
            
            this.addSendStep([pieceid , can3]);
            
            return can3
        };
    }

    /*
        # Правила для дубля
    */
    
    if(this.step.steps.length === 4){
        // счетчик свободных ячеек в шагах
        var free    = 0;
        // значение дубля
        var points  = this.step.steps[0][0];
        // разница между новым полем и старым
        var differ = newfield - oldfield;
        
        // считаем свобдные оставшиеся ходы
        for(var i = 0; i < 4; i++){
            if(this.step.steps[i][1] === 0){
                free++;
            }
        }
        
        // если нет свободных слотов в шагах
        if(free === 0) return oldfield;
        
        // проверяем кратно ли новое поле количеству очков
        if(differ % points === 0){
            // считаем сколько нужно шаговых очков для данного хода
            var countneedpoints = differ / points;
            
            // если колество очков достаточно
            if(countneedpoints <= free){
                // забиваем игровые шаги
                for(var i = 0; i < countneedpoints; i++){
                    
                    // ищем свободный шаг
                    for(var n = 0; n < 4; n++){
                        if(this.step.steps[n][1] === 0){
                            // забиваем его значением нового поля
                            this.step.steps[n][1] = newfield;
                            // сохраняем предыдущий шаг
                            this.step.steps[n][2] = oldfield;
                            // сохраняем идентификатор фихи
                            this.step.steps[n][3] = pieceid;
                            break;
                        }
                    }
                }
                
                // проверяем на правила данный ход
                if(this.handleRules(oldfield , newfield)){
                    // возвращаем значение нового поля
                    
                    this.addSendStep([pieceid , newfield]);
                    
                    return newfield;
                }
            } // countneedpoints <= free
        } // differ % points === 0
        
        // Если на переведенное поле не может сходить фишка,
        // переводим на ближайшее возможное
        
        console.log('controll clickboard' , clickboard);
        
        if(clickboard !== undefined) return false;
        
        var controll = true;
        var freecounter = 1;
        
        // функция ищет свободный эелемент
        function findFree(free , steps){
            var countsteps = 0;
            
            for(var i = 0; i < steps.length; i++){
                
                if(steps[i][1] === 0){
                    return i;
                }
                countsteps++;
            }
            
            if(countsteps === free){
                return false;
            }
        }
        
        while(controll){
            // проверяем минимальный возможный ход
            if(this.handleRules(oldfield , oldfield + points * freecounter)){
                // ищем неотхоженную ячейку
                for(var i = 0; i < freecounter; i++){
                    var elemfree = findFree(free , this.step.steps);
                    
                    if(elemfree !== false){
                        // забиваем ее значение номером новго поля
                        this.step.steps[elemfree][1] = oldfield + points * freecounter;
                        // сохраняем прежнюю позицию
                        this.step.steps[elemfree][2] = oldfield;
                        // сохраняем идентификатор фихи
                        this.step.steps[elemfree][3] = pieceid;
                    }else{
                        return oldfield;
                    }
                }
                
                this.addSendStep([pieceid , oldfield + points * freecounter]);
                
                // возвращаем ближайшее свободное поле
                return oldfield + points * freecounter;
                
                controll = false;
            }
            
            if(freecounter === free){controll = false;}
            
            freecounter++;
        }

    
    } // steps.length === 4
    
    
    // если ничего не дало результата, возвращаем прежнюю позицию
    return result;
};

/*
    # Вычисляем передвигаемое ли поле
    # field - поле которое нужно проверить
    # если есть хоть один возможный ход, возвращаем разрешение
*/
Rules.prototype.canMove = function ( field ) {
    var result = false;
    
    if(this.step.steps.length === 2){
        // может ли сходить на первую кость
        if(this.step.steps[0][1] === 0){
            result = this.handleRules(field , this.step.steps[0][0] + field);
        }
        
        if (result){return true;}
        
        // может ли сходить на вторую кость
        if(this.step.steps[1][1] === 0){
            result = this.handleRules(field , this.step.steps[1][0] + field);
        }
        
        if (result){return true;}
        
        // может ли сходить на сумму костей
        if(this.step.steps[1][1] === 0 && this.step.steps[0][1] === 0){
            result = this.handleRules(
                    field , this.step.steps[0][0] + this.step.steps[1][0] + field
                );
        }
        
        return result;
    }
    
    if(this.step.steps.length === 4){
        var free = 0;
        
        for(var i = 0; i < 4; i++){
            if(this.step.steps[i][1] === 0){
                free++;
            }
        }
        
        for(var i = 1; i <= free; i++){
            result = this.handleRules(field , field + this.step.steps[0][0] * i);
            if(result){return true;}
        }
        
        return result;
    }
};