var Rules = function(){};

Rules.prototype.step    = {};
Rules.prototype.fields  = [];
Rules.prototype.history = [];

Rules.prototype.game;
Rules.prototype.board;
Rules.prototype.prehouse = false;       // указатель, что фишки в преддомном состоянии
Rules.prototype.takehead = [];
Rules.prototype.controllhead = true;
Rules.prototype.piecetohouse = false;   // ход выводит фишку в дом
// необходимые функции для проверки возможности хода
Rules.prototype.rules = [
        'haveEnemy' // проверка на содержание фишек противника на поле
    ];

/* Сохраняем поля  */
Rules.prototype.setFields = function(fields){this.fields = fields;};
/* Сохраняем таблицу ходов */
Rules.prototype.setSteps = function(step){this.step = step;};
/* Сохраняем объекты, для того, чтобы в случае пользоваться их функциями */
Rules.prototype.setObjects = function(objects){
    if('game' in objects){
        this.game = objects.game;
    }
    
    if('board' in objects){
        this.board = objects.board;
    }
};

Rules.prototype.addSendStep = function(data){
    var pieceid     = data[0];
    var newfield    = data[1];
    
    // сохраняем историю перемещения фишки, для кнопки "ход назад"
    if(data[2] !== undefined){
        this.history.push({
            id          : pieceid ,
            oldfield    : data[2] ,
            newfield    : newfield
        });
    }
    
    this.step.send.push(
            {
                pieceid     : pieceid ,
                newfield    : newfield ,
                steps       : this.step.steps.slice() ,
                prehouse    : this.prehouse
            }
        );
};

Rules.prototype.checkPrehouse = function(){
    // если до этого проводилась проверка
    if(this.prehouse) return true;
    
    var needcount = 15;
    var count = 0;
    
        for(var i = 0; i < this.game.pieces.length; i++){
            if(this.game.pieces[i].color === 'white'){
                if(this.game.pieces[i].field > 18){
                    count++;
                }
            }else if(this.game.piececolor === 'black'){
                if(this.game.pieces[i].field > 18){
                    count++;
                }
            }
        }
    
    
    if(count === needcount){
        console.info('Все фишки перед домом' , this.game.piececolor);
        // делаем пометку, что проверка на преддом - проводилась
        this.prehouse = true;
        return true;
    }else{
        return false;
    }
};

/*
    # Правило имеет ли поле фишки соперника
    если нету, то возвращет истину
*/
Rules.prototype.haveEnemy = function(newfield){
    // если поле пустое, разрешаем перемещение
    if(this.board.fields[newfield].pieces.length === 0) return true;
    
    // если поле не пустое, проверяем является ли поле игрока
    return this.game.myField(newfield);
};

/*
    # Правила для момента вывода в дом
*/
Rules.prototype.prehouseRules = function(oldfield , newfield , boneval){
    //console.log('oldfield: ' + oldfield + '; newfield: ' + newfield + '; boneval: ' + boneval);
    
    if(oldfield === 19){
        return true;
    }
        
    if(boneval === 25 - oldfield){
        return true;
    }
        
    if(boneval < 25 - oldfield){
        return true;
    }
        
    if(boneval > 25 - oldfield){
        for(var i = oldfield - 1; i > 18; i--){
            if(
                this.game.board.fields[i].pieces.length !== 0 &&
                this.game.myField(i)){
                return false;
            }
        }
        return true;
    }
};

/*
    # Правило взятия с головы
*/
Rules.prototype.headRules = function(oldfield , pieceid){
    if(oldfield !== 1) return true;
    
    var bone1   = this.step.steps[0][0];
    var bone2   = this.step.steps[1][0];
    var two     = false;
    
    var steps = (bone1 === bone2) ? 4 : 2;
    
    // исключение первого хода
    if(steps === 4){
        if(this.game.countsteps === 0 || this.game.countsteps === 1){
            if(bone1 === 6 || bone1 === 4 || bone1 === 3){
                two = true;
            }
        }
    }
    
    // если не взято еще ни одной фишки с головы
    if(this.takehead.length === 0){
        this.takehead.push(pieceid);
        return true;
    // если уже выделена одна фишка в голове
    }else if(this.takehead.length === 1){
        // если можно взять 2 фишки
        if(two){
            // если фишка не сохранена
            if(this.takehead.indexOf(pieceid) === -1){
                // сохраняем её
                this.takehead.push(pieceid);
                return true;
            }else{
                // если фишка уже добавлена в голову
                return true;
            }
        }else{
            // если можно взять одну фишку
            // смотрим, добавлена ли она
            if(this.takehead.indexOf(pieceid) !== -1){
                return true;
            }else{
                return false;
            }
        }
    }else if(this.takehead.length === 2){
        if(this.takehead.indexOf(pieceid) !== -1){
            return true;
        }else{
            return false;
        }
    }
    
};

Rules.prototype.blockRule = function(oldfield , newfield){
    var controll        = 0;
    var backcontroll    = 0;
    
    var emptycontroll = true;
    
    if(newfield >= 1 && newfield <= 12){
        // проверяем фишки стоящеие впереди
        for(var i = newfield+1; i <= 12; i++){
            if(this.game.myField(i)){
                if(emptycontroll) controll++;
            }else if(this.board.fields[i].pieces.length === 0){
                emptycontroll = false;
            // если содержит фишку соперника
            }else if(this.board.fields[i].pieces.length !== 0){
                // значит можно ставить блок
                console.log('Впереди стоит фишка соперника, значит можно ставить блок');
                return true;
            }else{
                emptycontroll = false;
            }
        }
        
        emptycontroll = true;
        
        for(var i = newfield-1; i >= 1; i--){
            if(this.game.myField(i)){
                if(emptycontroll) backcontroll++;
            }else if(this.board.fields[i].pieces.length !== 0){
                emptycontroll = false;
            }else{
                emptycontroll = false;
            }
        }
    }
    
    if(backcontroll + 1 >= 6){
        console.log('backcontroll + 1' , backcontroll + 1);
        return false;
    }
    
    if(backcontroll + controll >= 6){
        console.log('backcontroll + controll' , backcontroll + controll);
        return false;
    }
    
    if(controll + 1 >= 6){
        console.log('controll + 1' , controll + 1);
        return false;
    }
    
    if(controll + backcontroll + 1 >= 6){
        console.log('controll + backcontroll + 1' , controll + backcontroll + 1);
        return false;
    }
    
    return true;
};


/*
    # Функция перебирает правила хода и проверяет может ли сходить
*/
Rules.prototype.handleRules = function(oldfield , newfield , boneval){
    
    // правило проверяет есть ли на поле фишки соперника,
    // возвращает разрешение.
    if(this.haveEnemy(newfield)){
        // проверка, если начался вывод в дом
        if(this.checkPrehouse()){
            if(this.prehouseRules(oldfield , newfield , boneval)){
                // указываем что проверяемых ход может вывести фишку в дом
                this.piecetohouse = true;
                return true;
            }else{
                return false;
            }
        }else{
            // если фишка идет в дом не выполнив условия перевода всех фишек
            // в последнее поле
            if(newfield >= 1 && newfield <= 6 && oldfield >= 19){
                console.error('Следующий ход в дом. Пока нельзя' , oldfield);
                return false;
            }else{
                if(this.blockRule(oldfield , newfield)){
                    return true;
                }else{
                    return false;
                }
            }
            
        }
        
        
    }else{
        return false;
    }
};

Rules.prototype.checkFieldNum = function(field){
    if(field > 24){
        return field - 24;
    }else{
        return field;
    }
};

Rules.prototype.calcMove = function(oldfield , newfield , pieceid , configs){
    var result = oldfield;
    var clickboard = false;
    
    if('clickboard' in configs){
        clickboard = configs.clickboard;
    }
    
    /*
        # Игрок передвигает фишку назад
    */
    if(newfield < oldfield){
        var max = false;
        var too = [];
        for(var i = 0; i < this.step.steps.length; i++){
            // ищем в истории поле с которого передвинута фишка
            if(this.step.steps[i][1] === oldfield){
                // проверяем ходит ли той же фишкой
                if(this.step.steps[i][3] === pieceid){
                    if(max){
                        if(max.field < this.step.steps[i][2]){
                            max = {field : this.step.steps[i][2] , n : i};
                        }else if(max.field === this.step.steps[i][2]){
                            too.push(i);
                        }
                        
                        
                    }else{
                        max = {field : this.step.steps[i][2] , n : i};
                    }
                }
            }
        }
        
        if(max){
            // если фишка возвращается в голову даем разрешение на перемещение головы
            if(this.step.steps[max.n][2] === 1){
                this.controllhead = true;
            }
            
            // стираем значение текущей ичейки очка
            this.step.steps[max.n][1] = 0;
            this.step.steps[max.n][2] = 0;
            this.step.steps[max.n][3] = 0;
            
            this.addSendStep([pieceid , max.field , oldfield]);
            
            /* если есть поля значение костей с таким же предыдущим полем, затираем их */
            if(too.length !== 0){
                for(var i = 0; i < too.length; i++){
                    // стираем значение текущей ичейки очка
                    this.step.steps[too[i]][1] = 0;
                    this.step.steps[too[i]][2] = 0;
                    this.step.steps[too[i]][3] = 0;
                }
            }
            
            // если найдено в истории, возвращаем значение предыдущего хода
            // этой фишки
            return max.field;
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
        var boneval;
        
        if(this.step.steps[0][1] === 0){
            boneval = this.step.steps[0][0];
            var num1 = this.checkFieldNum(this.step.steps[0][0] + oldfield);
            
            result = this.handleRules(oldfield , num1 , boneval);
            if(result){
                can1 = num1;
            }
        }
        
        if(this.step.steps[1][1] === 0){
            var num2;
            /* Делаем перешаг на вторую кость, если это возможно */
            if(this.step.steps[0][1] !== 0){
                if(this.step.steps[0][3] === pieceid){
                    boneval = this.step.steps[1][0];
                    num2= this.checkFieldNum(this.step.steps[1][0] + this.step.steps[0][2]);
                    result = this.handleRules(this.step.steps[0][2] , num2 , boneval);
                    
                    /*
                        # newfield === num2 - изменение, теперь фишка делает перешаг,
                        # только при условии, что игрок сам навел фишку на поле
                    */
                    
                    if(result && newfield === num2){
                        can2        = num2;
                        stepover    = true;
                    }else{                        
                        /*
                            # Либо делаем ход на вторую кость классически :-)
                        */
                        
                        boneval = this.step.steps[1][0];
                        num2 = this.checkFieldNum(this.step.steps[1][0] + oldfield);
                        
                        result = this.handleRules(oldfield , num2 , boneval);
                        if(result){
                            //console.log('step2');
                            can2 = num2;
                        }
                    }
                }else{
                    /*
                        # Либо делаем ход на вторую кость классически :-)
                    */
                    boneval = this.step.steps[1][0];
                    num2 = this.checkFieldNum(this.step.steps[1][0] + oldfield);
                    
                    result = this.handleRules(oldfield , num2 , boneval);
                    if(result){
                        can2 = num2;
                    }else{
                        /*
                            # Либо делаем ход на вторую кость классически :-)
                        */
                        
                        boneval = this.step.steps[1][0];
                        num2 = this.checkFieldNum(this.step.steps[1][0] + oldfield);
                        
                        result = this.handleRules(oldfield , num2 , boneval);
                        if(result){
                            can2 = num2;
                        }
                    }
                }
            }else{
                /*
                    # Либо делаем ход на вторую кость классически :-)
                */
                
                boneval = this.step.steps[1][0];
                num2 = this.checkFieldNum(this.step.steps[1][0] + oldfield);
                
                result = this.handleRules(oldfield , num2 , boneval);
                if(result){
                    can2 = num2;
                }
            }
        }
        
        // ход на суммо очков
        if(this.step.steps[1][1] === 0 && this.step.steps[0][1] === 0){
            boneval = this.step.steps[0][0] + this.step.steps[1][0];
            var num3 = this.checkFieldNum(this.step.steps[0][0] + this.step.steps[1][0] + oldfield);
            
            var val1 = this.handleRules(oldfield , num1 , this.step.steps[0][0]);
            
            // если игрок может сходить на значение первой кости
            if(val1){
                // проверям может ли он сходить на сумму очков
                result = this.handleRules(oldfield , num3 , boneval);
                    
                if(result){
                    can3 = num3;
                }
            }
        }
        
        // условие, что игрок после первого хода хочет сходить на сумму очков
        if(
            this.step.steps[0][1] !== 0 &&
            this.step.steps[1][1] === 0 &&
            this.step.steps[0][3] === pieceid &&
            newfield !== this.checkFieldNum(this.step.steps[0][2] + this.step.steps[1][0])){
            
            boneval = this.step.steps[0][0] + this.step.steps[1][0];
            var num4 = this.checkFieldNum(this.step.steps[0][1] + this.step.steps[1][0]);
            
            result = this.handleRules(
                    oldfield , num4 , boneval
                );
            
            if(result){
                can4 = num4;
            }
        }
        
        // если новое поле является возможным то перетаскиваем на него
        if(can1 === newfield){
            this.step.steps[0][1] = newfield;
            this.step.steps[0][2] = oldfield;    // сохраняем предыдущиее поле
            this.step.steps[0][3] = pieceid;     // сохраняем идентификатор фихи
            
            this.addSendStep([pieceid , can1 , oldfield]);
            
            //console.log('return here');
            
            //console.log('return can1' , can1);
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
                
                this.addSendStep([pieceid , can2 , oldfield]);
                
                //console.log('return here');
                
                return can2;
        }
        
        // если фишка переведена сразу на значение второй кости
        if(can2 === newfield && this.step.steps[0][1] === 0){
            this.step.steps[1][1] = newfield;
            this.step.steps[1][2] = oldfield;    // сохраняем предыдущее поле
            this.step.steps[1][3] = pieceid;     // сохраняем идентификатор фихи
            
            this.addSendStep([pieceid , can2 , oldfield]);
            
            //console.log('return here');
            
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
            
            this.addSendStep([pieceid , can3 , oldfield]);
            
            console.log('return here');
            
            return can3;
        }
        
        if(can4 === newfield) {
            this.step.steps[1][1] = newfield;
            this.step.steps[1][2] = oldfield;
            this.step.steps[1][3] = pieceid;
            
            this.addSendStep([pieceid , can4 , oldfield]);
            
            //console.log('return here');
            
            return can4;
        }
        
        // если к функции идет обращение через клик на доску
        
        if(clickboard){
            //console.log('clickboard click.' , newfield , can1 , can2 , can3 , can4);
            return false;
        }
        
        // правило вывода в дом, если на второе значение кости можно вывести в дом,
        // то ходит на второе значение
        if(can2 && this.piecetohouse){
            this.step.steps[1][1] = can2;
            this.step.steps[1][2] = oldfield; // сохраняем предыдущиее поле
            this.step.steps[1][3] = pieceid;     // сохраняем идентификатор фихи
            
            this.addSendStep([pieceid , can2 , oldfield]);
            
            this.piecetohouse = false;
            
            //console.log('return can2' , can2);
            return can2;
        }
        
        // правило импульса (шеф сам так назвал)
        if(can2 && configs.movemax){
            this.step.steps[1][1] = can2;
            this.step.steps[1][2] = oldfield; // сохраняем предыдущиее поле
            this.step.steps[1][3] = pieceid;     // сохраняем идентификатор фихи
            
            this.addSendStep([pieceid , can2 , oldfield]);
            
            //console.log('return can2' , can2);
            return can2;
        }
        
        // вычисление ближайшего поля, от места, где отпустили фишку
        if(can1 && can2){
            if(Math.abs(newfield - can1) < Math.abs(newfield - can2)){
                can2 = false;
            }else{
                can1 = false;
            }
        }
        
        
        // иначе ходим минамально возможным либо суммой
        if(can1) {
            this.step.steps[0][1] = can1;
            this.step.steps[0][2] = oldfield; // сохраняем предыдущиее поле
            this.step.steps[0][3] = pieceid;     // сохраняем идентификатор фихи
            
            this.addSendStep([pieceid , can1 , oldfield]);
            
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
            
            this.addSendStep([pieceid , can2 , oldfield]);
            
            //console.log('return can2' , can2);
            return can2;
        };
        if(can3) {
            this.step.steps[0][1] = can3;
            this.step.steps[1][1] = can3;
            
            this.step.steps[0][2] = oldfield; // сохраняем предыдущиее поле
            this.step.steps[1][2] = oldfield;
            
            this.step.steps[0][3] = pieceid;     // сохраняем идентификатор фихи
            this.step.steps[1][3] = pieceid;
            
            this.addSendStep([pieceid , can3 , oldfield]);
            
            //console.log('return can3' , can3);
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
        if(free === 0) {
            //console.log('return oldfield' , oldfield);
            return oldfield;
        };
        
        // проверяем кратно ли новое поле количеству очков
        if(differ % points === 0 && oldfield !== newfield){
            // считаем сколько нужно шаговых очков для данного хода
            var countneedpoints = differ / points;
            
            // если колество очков достаточно
            if(countneedpoints <= free){
                var controll = 0;
                
                for(var i = 1; i <= countneedpoints; i++){
                    if(this.handleRules(oldfield , this.checkFieldNum(oldfield + points * i , points * i))){
                        controll++;
                    }
                }
                
                if(controll === countneedpoints){
                    // забиваем игровые шаги
                    for(var i = 0; i < countneedpoints; i++){
                        // ищем свободный шаг
                        for(var n = 0; n < 4; n++){
                            if(this.step.steps[n][1] === 0){
                                // забиваем его значением нового поля
                                this.step.steps[n][1] = this.checkFieldNum(newfield);
                                // сохраняем предыдущий шаг
                                this.step.steps[n][2] = oldfield;
                                // сохраняем идентификатор фихи
                                this.step.steps[n][3] = pieceid;
                                break;
                            }
                        }
                    }
                    
                    this.addSendStep([pieceid , this.checkFieldNum(newfield) , oldfield]);
                    //console.log('return newfield' , newfield);
                    return newfield;
                }
                
            } // countneedpoints <= free
        } // differ % points === 0
        
        // Если на переведенное поле не может сходить фишка,
        // переводим на ближайшее возможное
        
        //console.log('controll clickboard' , clickboard);
        
        if(clickboard){
            //console.log('return false clickboard');
            return false;
        }
        
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
        
        var elemfree = false;
        elemfree = findFree(free , this.step.steps);
        
        var can5 = this.checkFieldNum(oldfield + points)
        
        if(this.handleRules(oldfield , can5 , points)){
             // забиваем ее значение номером новго поля
            this.step.steps[elemfree][1] = can5;
            // сохраняем прежнюю позицию
            this.step.steps[elemfree][2] = oldfield;
            // сохраняем идентификатор фихи
            this.step.steps[elemfree][3] = pieceid;
            
            this.addSendStep([pieceid , can5 , oldfield]);
            //console.log('return can5' , can5);
            return can5;
        }else{
            //console.log('return oldfield' , oldfield);
            return oldfield;
        }
    } // steps.length === 4
    
    
    // если ничего не дало результата, возвращаем прежнюю позицию
    if(oldfield === 1){
        this.controllhead = true;
    }
    
    //console.log('return oldfield' , oldfield);
    return oldfield;
};

/*
    # Вычисляем передвигаемое ли поле
    # field - поле которое нужно проверить
    # если есть хоть один возможный ход, возвращаем разрешение
*/
Rules.prototype.canMove = function ( field ) {
    var boneval;
    field = (field > 24) ? 24 : field;
    field = (field < 1)  ? 1  : field;
    
    var result = false;
    
    // если с головы уже взяли фишки, поле непередвигаемое
    if(field === 1){
        if(!this.controllhead){
            //console.log('return false. С головы уже взяли')
            return false;
        }
    }
    
    if(this.step.steps.length === 2){
        // может ли сходить на первую кость
        if(this.step.steps[0][1] === 0){
            boneval = this.step.steps[0][0];
            
            result = this.handleRules(field , this.checkFieldNum(this.step.steps[0][0] + field) , boneval);
        }
        
        if (result){
            //console.log('return true here');
            return true;
        }
        
        // может ли сходить на вторую кость
        if(this.step.steps[1][1] === 0){
            boneval = this.step.steps[1][0];
            result = this.handleRules(field , this.checkFieldNum(this.step.steps[1][0] + field) , boneval);
        }
        
        if (result){
            //console.log('return true here');
            return true;
        }
        
        if(this.step.steps[0][1] !== 0 && this.step.steps[1][1] === 0){
            boneval = this.step.steps[1][0];
            result = this.handleRules(field , this.checkFieldNum(this.step.steps[0][2] + this.step.steps[1][0]) , boneval);
        }
        
        if(result){
            //console.log('return true here');
            return true;
        }
        
        // может ли сходить на сумму костей
        if(this.step.steps[1][1] === 0 && this.step.steps[0][1] === 0){
            boneval = this.step.steps[0][0] + this.step.steps[1][0];
            
            if(this.handleRules(field , this.checkFieldNum(this.step.steps[0][0] + field) , boneval) ||
            this.handleRules(field , this.checkFieldNum(this.step.steps[1][0] + field) , boneval)            
            ){
                result = this.handleRules(
                    field , 
                    this.checkFieldNum(this.step.steps[0][0] + this.step.steps[1][0] + field) ,
                    boneval
                );                
            }
            
            
        }
        //console.log('return true here' , result);
        return result;
    }
    
    if(this.step.steps.length === 4){
        var free = 0;
        
        for(var i = 0; i < 4; i++){
            if(this.step.steps[i][1] === 0){
                free++;
            }
        }
        
        if(free !== 0){
            result = this.handleRules(
                field ,
                this.checkFieldNum(field + this.step.steps[0][0]) ,
                this.step.steps[0][0]
            );
        }
        
        /*
        for(var i = 1; i <= free; i++){
            result = this.handleRules(
                field ,
                this.checkFieldNum(field + this.step.steps[0][0] * i) ,
                this.step.steps[0][0] * i
            );
            //if(!result){return false;}
            if(result){
                //console.log('return true here');
                return true;
            }
        }
        */
        
        //console.log('return result here' , result);
        return result;
    }
};