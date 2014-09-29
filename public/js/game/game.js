var Game = function(objboard , objrules , objbones , objsocket){
    this.board  = objboard;
    this.rules  = objrules;
    this.bones  = objbones;
    this.socket = objsocket;
};

/* 
    #
    #  Упровляющие объекты системы
    #
*/
Game.prototype.board    = {};
Game.prototype.rules    = {};
Game.prototype.socket   = {};
// ### конец управляющих объектов системы

Game.prototype.meselement   = '#gamemessage';
Game.prototype.type         = 'long';   // тип игры
Game.prototype.onepos       = true;     // фишки распалагаются всега в одной позиции
Game.prototype.pieces       = [ /* */];
Game.prototype.side         = '';       // left || right
Game.prototype.piececolor   = '';       // white || black
// timers
Game.prototype.timelot      = 3000;

Game.prototype.enemy        = {};

Game.prototype.imageObjects = {};

Game.prototype.step         = {
    player  : '' ,      // self || enemy 
    bones   : [] ,
    side    : 'left' ,  // left || right
    steps   : {} ,
    points  : 0
};


/*
    # Выводит сообщение пользователю
    #
    #
*/
Game.prototype.setMessage = function(message){
    $(this.meselement).html(message);
};

/*
    # Инициализация фишек
    #
    #
*/
Game.prototype.initPieces = function(pieces){
    
    this.pieces = [];
    
    switch(this.type){
        /*  
            ########     ########       ########    ########
            ####   Тип создания фишек для длинных нард  ####
            ########    ########        ########    ########
        */
        
        case 'long':
            for(var i = 0; i < 30; i++){
                var pieceid = pieces[i];
                if (i < 15){
                    // создаем объекты фишек
                    
                    this.pieces[i] = new Piece( 'white' , pieceid , this.board.mainlayer , this.board.stage , 'left' , this.imageObjects) ;

                    // если фишки должны всегда находиться в одном положении
                    if(this.onepos){
                        // если соперник выиграл
                        if(this.step.player === 'enemy'){
                            // распологаем белые слева
                            this.enemy.side = 'left';
                            this.side       = 'right';
                            
                            this.startPiecesPositions(this.pieces[i].obj , 13 , this.pieces[i]);
                        }else{
                            // располагаем черные справа
                            this.enemy.side = 'right';
                            this.side       = 'left';
                            this.startPiecesPositions(this.pieces[i].obj , 1 , this.pieces[i]);
                        }
                    }
                }else{
                    this.pieces[i] = new Piece( 'black' , pieceid , this.board.mainlayer , this.board.stage , 'right' , this.imageObjects) ;
                    
                    // если фишки должны всегда находиться в одном положении
                    if(this.onepos){
                        // если соперник выиграл
                        if(this.step.player === 'enemy'){
                            // распологаем черные справа
                            this.startPiecesPositions(this.pieces[i].obj , 1 , this.pieces[i]);
                        }else{
                            // распологаяем черные слева
                            this.startPiecesPositions(this.pieces[i].obj , 13 , this.pieces[i]);
                        }
                    }
                }
            }
            break;
        default : console.error("Передан неизвестный тип игры");
    }
}


/*
    #
    # procedure startPiecesPositions(obj pieceobj , num fieldnum)
    # функция для стартового перемещения фишек
    #
*/

Game.prototype.startPiecesPositions = function(pieceobj , fieldnum , piece){
    var position = this.board.calcLastFieldPos(fieldnum);
    
    piece.x = position.x;
    piece.y = position.y;    
    
    // перемещаем фишку
     pieceobj.x(position.x);
     pieceobj.y(position.y);
            
    // добавляем фишку на поле
    this.board.addPiece(pieceobj.id() , fieldnum);
}

/*
    # Устанавливаем слушателей серевера :-)
    #
    #
*/
Game.prototype.setListener = function(name , obj , fun){
    var self = this;
    this.socket.connection.on(name , function(data){
        if(obj === 'Game'){
            if(fun in self){
                self[fun](data);
            }else{console.error("В объекте game не найден метод " , fun)}
        }else{
            if(obj in self){
                if(fun in self[obj]){
                    self[obj][fun](data);
                }else{console.error("Обращение к несуществующему методу в объекте " , obj , fun)}
            }else{ console.error("Обращение к несуществующему объекту " , obj); }
        }
    });
};

Game.prototype.sendRequest = function(name , data){
    this.socket.connection.emit(name , data);
};

/*
    # Регестрируемся на сервере
    # 
    #
*/
Game.prototype.registrOnServer = function(data){
    this.socket.connection.emit('registr' , data );
    this.setMessage("Ожидание подключения соперника");
};

/*
    # Главная функция шага
    # Активирует необходимые фишки
    #
*/
Game.prototype.letsRock = function(){
    // Чей сейчас ход (self  || enemy)
    var player = this.step.player;
    
    // Выводим сообщение
    if(player === 'enemy'){this.setMessage('Ход противника');}else{this.setMessage('Ваш ход');}
    
    if(player === 'self'){
        // Считаем количество ходов
        this.calcPoints();
        
        // Теперь необходимо активировать возможные фишки
        this.activatePieces();
    }
};

/*
    # Перебирает поля и активирует возможно ходящие фишки
    #
    #
*/
Game.prototype.activatePieces = function(){
    // отправляем в прававой объект поля доски
    this.rules.setFields(this.board.fields);
    // отправляем объект шагов правовому объетку
    this.rules.setSteps(this.step.steps);
    
    // перебираем поля
    for(var field = 1; field < this.board.fields.length; field++){
        // если поле содержит фишки
        if(this.board.fields[field].pieces.length !== 0){
            // является ли поле игрока
            if(this.myField(field)){
                var canmove = this.rules.canMove(field);
                // если поле может ходить
                if(canmove){
                    // получаем последнюю фишку
                    var lastpiece = this.getLastPiece(field);
                    
                    // запускаем разрешение передвигать фишку
                    this.setDraggable(lastpiece , field);
                }else{
                    console.log('Поле непередвигаемое' , field);
                }
            }else{
                if(field === 1 || field === 13){
                    console.log('Это не поле игрока' , field);
                }
            }
        }       // if pieces.length !== 0
    }           // for fields
};

Game.prototype.setDraggable = function(piece , oldfield){
    
    var self        = this;
    var pieceobj    = this.getPiece(piece.id());
    
    piece.draggable(true);
    
    piece.on('dragend' , function(){
        var node = this;
        var x = node.x();
        var y = node.y();
        
        // вычисляем поле на котором остановилась фишка
        var newfield    = self.board.calcField(x , y);
        
        // вычисляем поле, на которое может сходить фишка
        var movefield   = self.rules.calcMove(oldfield , newfield , node.id());
        
        // удаляем идентификатор фишки из предыдущей позиции
        var lastpos     = self.calcPiecePos(node.id());
        self.board.fields[lastpos[0]].pieces.splice(lastpos[1] , 1);
        
        // вычисляем координаты поля на которое можно сходить
        var pos         = self.board.calcLastFieldPos(movefield);
        
        // перемещаем идентификатор фишки
        self.moveIdPiece(movefield , node.id());
        
        // перемещаем фишку
        pieceobj.moveTo(pos.x , pos.y);
        
        // после завершения хода блокируем фишки, для новых расчетов
        self.blockedPieces();
        
        // очищаем обработчик перемещения для новых расчетов
        this.off('dragend');
        
        self.activatePieces();
    });
    
};

Game.prototype.blockedPieces = function(){
    for(var i = 0; i < this.pieces.length; i++){
        this.pieces[i].obj.draggable(false);
    }
};


/*
    # Перемещает в полях идентификаторы
    #
    #
*/
Game.prototype.moveIdPiece = function(newfield , id){
    this.board.fields[newfield].pieces.push(id);
};

/*
    # ищет фишку в полях
    #
    #
*/
Game.prototype.calcPiecePos = function(id){
    var piece = false;
    for(var i = 1; i <= this.board.fields.length; i++){
		if(this.board.fields[i] !== undefined){
			for(var n = 0; n < this.board.fields[i].pieces.length; n++){
				if(this.board.fields[i].pieces[n] !== undefined){
					if(id == this.board.fields[i].pieces[n]){
						piece = [i , n];
					}
    			}
			}
		}
	}
	return piece;
}

/*
    # fun getLastPiece
    # возвращает последнюю фишку в поле
    #
*/
Game.prototype.getLastPiece = function(field){
    var lastkey = this.board.fields[field].pieces.length-1;
    var lastid  = this.board.fields[field].pieces[lastkey];
    
    var pieceobj = this.getPieceObj(lastid);
    if(!pieceobj){console.error('При получении последей фиши произошла ошибка')}
    
    return pieceobj;
};

Game.prototype.getPieceObj = function(id){
    var object = false;
    for(var i = 0; i < this.pieces.length; i++){
       if(this.pieces[i].id === id){
           object = this.pieces[i].obj;
       }
    }
    
    return object;
};

Game.prototype.getPiece = function(id){
    var object = false;
    for(var i = 0; i < this.pieces.length; i++){
       if(this.pieces[i].id === id){
           object = this.pieces[i];
       }
    }
    
    return object;
}

/*
    # Функция определяет свое ли поле
    #
    #
*/
Game.prototype.myField = function(field){
    // есть ли на поле вообще фишки
    if(this.board.fields[field].pieces.length !== 0){
        // берем идентификатор первой фишки в поле
       var pieceid  = this.board.fields[field].pieces[0];
       var piecenum = 0;
       // ищем фишку в объекте фишек
       for(var i = 0; i < this.pieces.length; i++){
           if(this.pieces[i].id === pieceid){
               piecenum = i;
           }
       }
       
       // если тип фишки совпадает с типом игрока
       if(this.pieces[piecenum].color === this.piececolor){
           // значит поле игрока
           return true;
       }else{
           if(field === 1){
            console.log('Не совпадает цвет фишки. ' 
                        + '  piececolor:' + this.pieces[piecenum].color 
                        + '; mycolor: ' + this.piececolor 
                        + '; pieceid: ' + this.pieces[piecenum].id
                        + '; piecenum: ' + piecenum);
                        this.pieces[piecenum].obj.stroke('green');
           }
           return false;
       }
    // если поле свободное
    }else{
        if(field === 1){
            console.log('Поле свободное' , field);
        }
        return false;
    }
};

Game.prototype.calcPoints = function(){
    var bone1 , bone2;
    
    if(this.step.bones[0] < this.step.bones[1]){
        bone1 = this.step.bones[0];
        bone2 = this.step.bones[1];
    }else{
        bone1 = this.step.bones[1];
        bone2 = this.step.bones[0];
    }
    
    // колчество возможных шагов
    var steps = (bone1 === bone2) ? 4 : 2;
    
    var st = [];
    
    // st[ячейка очка] = [значение кости , поля занятое ячейкой , старое поле, id фишки]
    
    if(steps === 2){
        st[0] = [bone1 , 0 , 0 , 0];
        st[1] = [bone2 , 0 , 0 , 0];
    }
    
    if(steps === 4){
        st[0] = [bone1 , 0 , 0 , 0];
        st[1] = [bone1 , 0 , 0 , 0];
        st[2] = [bone1 , 0 , 0 , 0];
        st[3] = [bone1 , 0 , 0 , 0];
    }
    
    this.step.steps = st;
};


/* 
    # Получаем стартовые данные об игре
    # и инициализируем игру
    #
*/
Game.prototype.takeGameData = function(data){
    var self = this;
    
    if(typeof(data) === 'object'){
        if('id' in data && 'pieces' in data && 'bones' in data && 'lotbones' in data){
            if(data.id !== undefined && data.pieces !== undefined && data.bones !== undefined && data.lotbones !== undefined){
                console.log('Получены данные начала игры с сервера: ' , data);
                // Сохраняем значение костей для хода
                this.step.bones = data.bones;
                //this.step.bones = [2 , 2];
                
                // Анимируем жеребьевку
                this.animateLot(data.lotbones);
                
                // Определяем чей ход
                if(data.lotbones[0] > data.lotbones[1]){
                    this.step.player        = 'self';
                    this.piececolor         = 'white';
                    this.board.piececolor   = 'white';
                }else{
                    this.step.player        = 'enemy';
                    this.piececolor         = 'black';
                    this.board.piececolor   = 'black';
                }
                
                /*
                    # Инициализация фишек
                    # Она происходит после анимации жеребьевки
                    #
                */
                setTimeout(function() {
                    self.initPieces(data.pieces);
                    self.moveBonesToNeed();
                    
                    // После передвижения фишек, снова взбалтываем их
                    // для определения очков хода
                    setTimeout(function(){
                        // время тряски
                        var shaketime   = self.timelot / 6;
                        // взбалтываем первую кость
                        self.bones.shake(0 , shaketime , self.step.bones[0]);
                        
                        setTimeout(function(){
                            // взбалтываем вторую кость
                            self.bones.shake(1 , shaketime , self.step.bones[1]);
                            
                            // НАКОНЕЦ НАЧИНАЕМ ИГРУ!!!
                            self.letsRock();
                            
                        } , shaketime);
                    // время ожидания равно длительности анимации
                    } , self.bones.moveanimtime);
                }, this.timelot);
                
            }else{console.error("Один из параметров игры не определен" , data )}
        }else{console.error("Один из параметров игры отсутсвует. " , data );}
    }else{console.error("Данные игры переданы не объектом" , data );}
};

Game.prototype.moveBonesToNeed = function(){
    // если фишки должны всегда находиться в одном положении
    if(this.onepos){
        if(this.step.player === 'enemy'){
            if(this.enemy.side === 'left'){
                this.bones.moveToSide(2 , 'left');
            }else{
                this.bones.moveToSide(2 , 'right');
            }
        }else{
            if(this.enemy.side === 'left'){
                this.bones.moveToSide(2 , 'right');
            }else{
                this.bones.moveToSide(2 , 'left');
            }
        }
    }
};

/*
    # Функция анимаирует жеребьевку
    # lots - значение костей -> array(lot1 , lot2)
    #
*/
Game.prototype.animateLot = function(lots){
    var self        = this;
    var shaketime   = this.timelot / 6;
    
    this.setMessage('Игрок подключен. Идет жеребьевка');

    // меням сторону расположения кости
    this.bones.changeSide(0 , 'left');
    // взбалтываем и перемешиваем
    this.bones.shake(0 , shaketime , lots[0]);

    // спустя секунды шейкеруем 2 кость
    setTimeout(function() {
        // перемещаем 2 кость вправо
        self.bones.changeSide(1 , 'right');
        // взбалтываем и перемещиваем
        self.bones.shake(1 , shaketime , lots[1]);
        // Отображаем чей ход
        if(self.step.player === 'enemy'){
            self.setMessage('Жеребьевка окончена. Ход противника');
        }else{
            self.setMessage('Жеребьевка окончена. Ваш ход');
        }
    }, shaketime);
};

Game.prototype.loadImages = function(callback){
    var self = this;
    var imagesrcWhite    = '../images/pieces/white.png';
    var imagesrcBlack    = '../images/pieces/black.png';
    
    var whiteObj = new Image();
    var blackObj = new Image();
    
    whiteObj.onload = function(){
        self.imageObjects = {white : whiteObj , black : blackObj};
        
        callback();
    };
    whiteObj.src = imagesrcWhite;
    blackObj.src = imagesrcBlack;
}