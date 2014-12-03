var Game = function(objboard , objrules , objbones , objsocket){
    this.board  = objboard;
    this.rules  = objrules;
    this.bones  = objbones;
    this.socket = objsocket;
    
    this.setUndoClick();
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

Game.prototype.meselement   = '#gamestatus';
Game.prototype.type         = 'long';   // тип игры | long || prehouse // blocktest // restep
Game.prototype.onepos       = true;     // фишки распалагаются всега в одной позиции
Game.prototype.pieces       = [ /* */];
Game.prototype.side         = '';       // left || right
Game.prototype.piececolor   = '';       // white || black
Game.prototype.sendstep     = 'every';  // every || all - передавать шаги каждый/все
Game.prototype.gamedialog   = '#gamedialog';

// timers
Game.prototype.timelot      = 3000; // общее время жеребьевки
Game.prototype.cancelStep   = 0; // время на отмену хода
Game.prototype.dblclicktime = 200;  // ожидание да двойной клик
Game.prototype.ruletimemes  = 2000; // время на выведение сообщений системы правил

Game.prototype.countsteps   = 0;
Game.prototype.takehead     = [];
Game.prototype.endstep      = false;
Game.prototype.inhouse      = 0;
Game.prototype.gamefinish   = false;

Game.prototype.imageObjects = {};
Game.prototype.light        = {};
Game.prototype.timer        = {};

Game.prototype.self         = {
    reinvite    : false
};

Game.prototype.enemy        = {
    reinvite : false
};

Game.prototype.step         = {
    player      : ''        ,   // self || enemy 
    bones       : []        ,
    side        : 'left'    ,   // left || right
    steps       : []        ,
    points      : 0         ,
    send        : []        ,   // массив для отправки хода сопернику
};

// global vars
Game.prototype.selectedpiece = false;


/*
    # Выводит сообщение пользователю
    #
    #
*/
Game.prototype.setMessage = function(message){
    $(this.meselement).html(message);
};

/* Очищаем данные текущей игры */
Game.prototype.clearGame = function(){
    var self = this;
    
    if($(self.gamedialog).hasClass('ui-dialog-content')){
        $(self.gamedialog).dialog('close');
    }
    
    
    // чистим таймер
    clearInterval(self.timer);
    
    // уничтожаем фишки    
    if(this.pieces.length !== 0){
        for(var i = 0; i < this.pieces.length; i++){
            this.pieces[i].obj.destroy();
            this.board.stage.batchDraw();
        }
        this.pieces = [];
    }
    
    // удаляем инфорацию о располажении фишек
    for(var i = 0; i < this.board.fields.length; i++){
        this.board.fields[i].pieces = [];
    }
    
    $('#outwhite').html('');
    $('#outblack').html('');
    
    this.step.steps = [];
    this.step.send  = [];
    this.rules.step = {};
    this.rules.prehouse = false;
    
    this.rules.controllhead = true;
    this.rules.takehead     = [];
    
    this.type = 'long';
    
    this.side         = '';
    this.piececolor   = '';
    
    this.countsteps   = 0;
    this.takehead     = [];
    this.endstep      = false;
    this.inhouse      = 0;
    
    this.enemy        = {};
    this.light        = {};
    this.timer        = {};
};

/*
    # Инициализация фишек
    #
    #
*/
Game.prototype.initPieces = function(pieces){
    
    this.pieces = [];
    var pieceid;
    var self = this;
    
    switch(this.type){
        /*  
            ########     ########       ########    ########
            ####   Тип создания фишек для длинных нард  ####
            ########    ########        ########    ########
        */
        
        case 'long':
            for(var i = 0; i < 30; i++){
                pieceid = pieces[i];
                if (i < 15){
                    // создаем объекты фишек
                    
                    this.pieces[i] = new Piece(
                                                'white' ,
                                                pieceid ,
                                                this.board.mainlayer ,
                                                this.board.stage ,
                                                'left' ,
                                                this.imageObjects ,
                                                this ,
                                                this.board
                                            );

                    // если фишки должны всегда находиться в одном положении
                    if(this.onepos){
                        // если соперник выиграл
                        if(this.step.player === 'enemy'){
                            this.pieces[i].field  = 13;
                            
                            // распологаем белые слева
                            this.enemy.side = 'right';
                            this.side       = 'left';
                            
                            this.startPiecesPositions(
                                this.pieces[i].obj ,
                                13 ,
                                this.pieces[i]
                                );
                        }else{
                            this.pieces[i].field  = 1;
                            
                            // располагаем черные справа
                            this.enemy.side = 'right';
                            this.side       = 'left';
                            this.startPiecesPositions(
                                this.pieces[i].obj ,
                                1 ,
                                this.pieces[i]
                            );
                        }
                    }
                }else{
                    this.pieces[i] = new Piece(
                            'black' ,
                            pieceid ,
                            this.board.mainlayer ,
                            this.board.stage ,
                            'right' ,
                            this.imageObjects ,
                            this ,
                            this.board
                        );
                    
                    // если фишки должны всегда находиться в одном положении
                    if(this.onepos){
                        // если соперник выиграл
                        if(this.step.player === 'enemy'){
                            this.pieces[i].field  = 1;
                            
                            // распологаем черные справа
                            this.startPiecesPositions(
                                this.pieces[i].obj ,
                                1 ,
                                this.pieces[i]
                            );
                        }else{
                            this.pieces[i].field  = 13;
                            
                            // распологаяем черные слева
                            this.startPiecesPositions(
                                this.pieces[i].obj ,
                                13 ,
                                this.pieces[i]
                            );
                        }
                    }
                }
            }
            break;
        
        case 'prehouse':
            function setPiece(num , field , i , self){
                for(var n = 0 ; n < num.length; n++){
                    if(i === num[n]){
                        self.pieces[i].field  = field;
                        // распологаем белые слева
                        self.enemy.side = 'right';
                        self.side       = 'left';
                                
                        self.startPiecesPositions(self.pieces[i].obj,field,self.pieces[i]);
                    }   
                }
            }
            
            // Расположение фишек для тестирования перевода фишек в дом
            
            /* ################## */
            
            for(var i = 0; i < 30; i++){
                pieceid = pieces[i];
                if (i < 15){
                    // создаем объекты фишек
                    
                    this.pieces[i] = new Piece(
                                                'white' ,
                                                pieceid ,
                                                this.board.mainlayer ,
                                                this.board.stage ,
                                                'left' ,
                                                this.imageObjects ,
                                                this ,
                                                this.board
                                            );

                    // если фишки должны всегда находиться в одном положении
                    if(this.onepos){
                        // если соперник выиграл
                        if(this.step.player === 'enemy'){
                            setPiece([0] , 6 , i , self);
                            setPiece([1] , 7 , i , self);
                            setPiece([2 , 3] , 8 , i , self);
                            setPiece([4 , 5 , 6] , 9 , i , self);
                            setPiece([7 , 8 , 9] , 10 , i , self);
                            setPiece([10 , 11 , 12] , 11 , i , self);
                            setPiece([13 , 14] , 12 , i , self);
                        }else{
                            setPiece([0] , 18 , i , self);
                            setPiece([1] , 19 , i , self);
                            setPiece([2 , 3] , 20 , i , self);
                            setPiece([4 , 5 , 6] , 21 , i , self);
                            setPiece([7 , 8 , 9] , 22 , i , self);
                            setPiece([10 , 11 , 12] , 23 , i , self);
                            setPiece([13 , 14] , 24 , i , self);
                        }
                    }
                }else{
                    this.pieces[i] = new Piece(
                            'black' ,
                            pieceid ,
                            this.board.mainlayer ,
                            this.board.stage ,
                            'right' ,
                            this.imageObjects ,
                            this ,
                            this.board
                        );
                    
                    // если фишки должны всегда находиться в одном положении
                    if(this.onepos){
                        // если соперник выиграл
                        if(this.step.player === 'enemy'){
                            setPiece([15] , 18 , i , self);
                            setPiece([16] , 19 , i , self);
                            setPiece([17 , 18] , 20 , i , self);
                            setPiece([19 , 20 , 21] , 21 , i , self);
                            setPiece([22 , 23 , 24] , 22 , i , self);
                            setPiece([25 , 26 , 27] , 23 , i , self);
                            setPiece([28 , 29] , 24 , i , self);
                        }else{
                            setPiece([15] , 6 , i , self);
                            setPiece([16] , 7 , i , self);
                            setPiece([17 , 18] , 8 , i , self);
                            setPiece([19 , 20 , 21] , 9 , i , self);
                            setPiece([22 , 23 , 24] , 10 , i , self);
                            setPiece([25 , 26 , 27] , 11 , i , self);
                            setPiece([28 , 29] , 12 , i , self);
                        }
                    }
                }
            }
            
            /* ###################### */
            
            
            break;
            
            /* #################### Block test ############################# */
            
            case 'blocktest':
            
            function setPiece(num , field , i , self){
                for(var n = 0 ; n < num.length; n++){
                    if(i === num[n]){
                        self.pieces[i].field  = field;
                        // распологаем белые слева
                        self.enemy.side = 'right';
                        self.side       = 'left';
                                
                        self.startPiecesPositions(self.pieces[i].obj,field,self.pieces[i]);
                    }   
                }
            }
            
            // Расположение фишек для тестирования перевода фишек в правиле блока
            
            for(var i = 0; i < 30; i++){
                pieceid = pieces[i];
                if (i < 15){
                    // создаем объекты фишек
                    
                    this.pieces[i] = new Piece(
                                                'white' ,
                                                pieceid ,
                                                this.board.mainlayer ,
                                                this.board.stage ,
                                                'left' ,
                                                this.imageObjects ,
                                                this ,
                                                this.board
                                            );

                    // если фишки должны всегда находиться в одном положении
                    if(this.onepos){
                        // если соперник выиграл
                        if(this.step.player === 'enemy'){
                            setPiece([0 , 1 , 2]    , 13 ,i , self);
                            setPiece([3]            , 15 ,i , self);
                            setPiece([4 , 5]        , 16 ,i , self);
                            setPiece([6 , 7]        , 17 ,i , self);
                            setPiece([8 , 9 , 10]   , 14 ,i , self);
                            setPiece([11]            , 20 ,i , self);
                            setPiece([12]            , 21 ,i , self);
                            setPiece([13]            , 22 ,i , self);
                            setPiece([14]            , 23 ,i , self);
                        }else{
                            setPiece([0 , 1 , 2]    , 1 ,i , self);
                            setPiece([3]            , 3 ,i , self);
                            setPiece([4 , 5]        , 4 ,i , self);
                            setPiece([6 , 7]        , 5 ,i , self);
                            setPiece([8 , 9 , 10]   , 2 ,i , self);
                            setPiece([11]            , 8 ,i , self);
                            setPiece([12]            , 9 ,i , self);
                            setPiece([13]            , 10 ,i , self);
                            setPiece([14]            , 11 ,i , self);
                        }
                    }
                }else{
                    this.pieces[i] = new Piece(
                            'black' ,
                            pieceid ,
                            this.board.mainlayer ,
                            this.board.stage ,
                            'right' ,
                            this.imageObjects ,
                            this ,
                            this.board
                        );
                    
                    // если фишки должны всегда находиться в одном положении
                    if(this.onepos){
                        // если соперник выиграл
                        if(this.step.player === 'enemy'){
                            setPiece([15 , 16 , 17]    , 1 ,i , self);
                            setPiece([18]            , 3 ,i , self);
                            setPiece([19 , 20]        , 4 ,i , self);
                            setPiece([21 , 22]        , 5 ,i , self);
                            setPiece([23 , 24 , 25]   , 2 ,i , self);
                            setPiece([26]            , 8 ,i , self);
                            setPiece([27]            , 9 ,i , self);
                            setPiece([28]            , 10 ,i , self);
                            setPiece([29]            , 11 ,i , self);
                        }else{
                            setPiece([15 , 16 , 17]    , 13 ,i , self);
                            setPiece([18]            , 15 ,i , self);
                            setPiece([19 , 20]        , 16 ,i , self);
                            setPiece([21 , 22]        , 17 ,i , self);
                            setPiece([23 , 24 , 25]   , 14 ,i , self);
                            setPiece([26]            , 20 ,i , self);
                            setPiece([27]            , 21 ,i , self);
                            setPiece([28]            , 22 ,i , self);
                            setPiece([29]            , 23 ,i , self);
                        }
                    }
                }
            }
            
            /* ###################### */
            
            
            break;
            
            /* #################### Block test end ######################### */
            
            
            /* #################### RESTEP test ############################# */
            
            case 'restep':
            
            function setPiece(num , field , i , self){
                for(var n = 0 ; n < num.length; n++){
                    if(i === num[n]){
                        self.pieces[i].field  = field;
                        // распологаем белые слева
                        self.enemy.side = 'right';
                        self.side       = 'left';
                                
                        self.startPiecesPositions(self.pieces[i].obj,field,self.pieces[i]);
                    }   
                }
            }
            
            // Расположение фишек для тестирования перевода фишек в правиле блока
            
            for(var i = 0; i < 30; i++){
                pieceid = pieces[i];
                if (i < 15){
                    // создаем объекты фишек
                    
                    this.pieces[i] = new Piece(
                                                'white' ,
                                                pieceid ,
                                                this.board.mainlayer ,
                                                this.board.stage ,
                                                'left' ,
                                                this.imageObjects ,
                                                this ,
                                                this.board
                                            );

                    // если фишки должны всегда находиться в одном положении
                    if(this.onepos){
                        // если соперник выиграл
                        if(this.step.player === 'enemy'){
                            setPiece([0]    , 13 ,i , self);
                            setPiece([1]    , 22 ,i , self);
                            setPiece([2]    , 2 ,i , self);
                            setPiece([3,4,5,6,7,8,9,10,11,12,13,14]    , 24 ,i , self);
                        }else{
                            setPiece([0]    , 1 ,i , self);
                            setPiece([1]    , 10 ,i , self);
                            setPiece([2]    , 14 ,i , self);
                            setPiece([3,4,5,6,7,8,9,10,11,12,13,14]    , 12 ,i , self);
                        }
                    }
                }else{
                    this.pieces[i] = new Piece(
                            'black' ,
                            pieceid ,
                            this.board.mainlayer ,
                            this.board.stage ,
                            'right' ,
                            this.imageObjects ,
                            this ,
                            this.board
                        );
                    
                    // если фишки должны всегда находиться в одном положении
                    if(this.onepos){
                        // если соперник выиграл
                        if(this.step.player === 'enemy'){
                            setPiece([15]    , 1 ,i , self);
                            setPiece([18]    , 3 ,i , self);
                            setPiece([16]    , 10 ,i , self);
                            setPiece([17]    , 14 ,i , self);
                            
                            setPiece([19,20,21,22,23,24,25,26,27,28,29]    , 12 ,i , self);
                        }else{
                            setPiece([15]    , 13 ,i , self);
                            setPiece([16]    , 22 ,i , self);
                            setPiece([17]    , 2 ,i , self); // блокирующая фишка
                            setPiece([18]    , 15 ,i , self); // блокирующая фишка
                            setPiece([19,20,21,22,23,24,25,26,27,28,29]    , 24 ,i , self);
                        }
                    }
                }
            }
            
            /* ###################### */
            
            
            break;
            
            /* #################### RESTEP test end ######################### */
        
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
                }else{
                    console.error(
                            "Обращение к несуществующему методу в объекте " ,
                            obj ,
                            fun
                        );
                }
            }else{ console.error("Обращение к несуществующему объекту " , obj);}
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
    
    // устанавливаем демо фишки
    if(this.piececolor === 'white'){
        $('#home1pl').html('Вы <br /> <img src="images/pieces/white.png" width="25" />');
        $('#home2pl').html('Соперник <br /> <img src="images/pieces/black.png"  width="25" />');
    }else{
        $('#home1pl').html('Вы <br /><img src="images/pieces/black.png" width="25" />');
        $('#home2pl').html('Соперник<br /> <img src="images/pieces/white.png" width="25"/>');
    }
    
    // Выводим сообщение
    if(player === 'enemy'){
        this.setMessage('Ход противника');
    }else{this.setMessage('Ваш ход');}
    
    if(player === 'self'){
        // Считаем количество ходов
        this.calcPoints();
        
        this.bones.lightControll( this.step.steps, true);
        
        // Теперь необходимо активировать возможные фишки
        this.activatePieces();
    }
};

/*
    # Чистим необходимые данные
*/
Game.prototype.clearData = function(){
    
};

/*
    # Считаем сколько у нас полей в распоряжении 
*/
Game.prototype.calcMyFields = function(){
    var countfields = 0;
    
    // перебираем поля
    for(var field = 1; field < this.board.fields.length; field++){
        // если поле содержит фишки
        if(this.board.fields[field].pieces.length !== 0){
            // является ли поле игрока
            if(this.myField(field)){
                countfields++;
            }
        }
    }
    
    return countfields;
};

Game.prototype.countFreeSteps = function(){
    var count = 0;
    
    for(var i = 0; i < this.step.steps.length; i++){
        if(this.step.steps[i][1] === 0){
            count++;
        }
    }
    
    return count;
};

Game.prototype.calcCan = function(){
    var countcanmove = 0;
    var canarray = [];
    for(var field = 1; field < this.board.fields.length; field++){
        // если поле содержит фишки
        if(this.board.fields[field].pieces.length !== 0){
            
            // проверять дом на возможность хода не нужно
            if(!this.rules.inhouse && field !== 1){
            
                // является ли поле игрока
                if(this.myField(field)){
                    var canmove = this.rules.canMove(field);
                    // если поле может ходить
                    if(canmove){
                        countcanmove++;
                        canarray.push(field);
                    }
                }
            
            }
        }
    }
    
    if(countcanmove === 0){
        return false;
    }else{
        //console.log('cans count: ' , countcanmove);
        //console.log('canfields: ' , canarray);
        return true;
    }
};

/*
    # Перебирает поля и активирует возможно ходящие фишки
    #
    #
*/
Game.prototype.activatePieces = function(){
    if(this.inhouse !== 15){
    var countcanmove    = 0;
    var self            = this;
    
    // отправляем в прававой объект поля доски
    this.rules.setFields(this.board.fields);
    // отправляем объект шагов правовому объетку
    this.rules.setSteps(this.step);
    this.rules.setObjects({
        game : this ,
        board : this.board
    });
    
    // перебираем поля
    for(var field = 1; field < this.board.fields.length; field++){
        // если поле содержит фишки
        if(this.board.fields[field].pieces.length !== 0){
            // является ли поле игрока
            if(this.myField(field)){
                var canmove = this.rules.canMove(field);
                
                // если поле может ходить
                if(canmove){
                    countcanmove++;
                    
                    // получаем количество оставшихся ходов
                    var countfreesteps = this.countFreeSteps();
                    
                    var lastpieces = this.getLastPieces(field , countfreesteps);
                    
                    // получаем последнюю фишку
                    //var lastpiece = this.getLastPiece(field);
                    
                    this.setDraggablePieces(lastpieces , field);
                    
                }else{
                    //console.log('Поле непередвигаемое' , field);
                }
            }else{
                if(field === 1 || field === 13){
                    //console.log('Это не поле игрока' , field);
                }
            }
        }       // if pieces.length !== 0
    }           // for fields
    
    /*
        # Если закончились шаги
        # даем возможность отмены хода
    */
    
    if(countcanmove === 0){
        if(this.lastStep()){
            this.setMessage("Закончились ходы. Отмена хода 3 секунды");
        }else{
            if(!this.calcCan()){
                this.setMessage("Нет возможных ходов. Передача хода 3 сек");
            }
        }
        
        var piece , piecepos;
        var pieces = [];
        
        // собираем фишки для активации
        for(var i = 0; i < this.step.steps.length; i++){
            if(pieces.indexOf(this.step.steps[i][3]) === -1){
                pieces.push(this.getPiece(this.step.steps[i][3]));
            }
        }
        
        this.setDraggablePieces(pieces);
        var can = this.calcCan();
        // если игрок не отменил свой ход передаем ход
        setTimeout(function() {
                if(self.lastStep(countcanmove)){
                    // увеличив��ем количество ходов
                    self.countsteps++;
                    // очищаем счетчик взятия с головы
                    self.rules.takehead = [];
                    self.rules.controllhead = true;
                    
                    self.finishSteps();
                }else{
                    if(self.calcCan()){
                        self.setMessage("Ход отменен");
                    }else{
                        self.setMessage("Нет возможных ходов");
                        // увеличиваем количество ходов
                        self.countsteps++;
                        // очищаем счетчик взятия с головы
                        self.rules.takehead = [];
                        self.rules.controllhead = true;
                    
                        self.finishSteps();
                    }
                    
                }
        }, self.cancelStep);
    }
    
    } // inhouse
    else{
        var contrwin = this.havePieces();
        if(contrwin.win){
            this.actionDialog('win');
        } else{
            this.inhouse = contrwin.inhouse;
            this.activatePieces();
        }
    }
};

/*
    # Функция считает количество оставшихся фишек игрока
*/ 
Game.prototype.havePieces = function(){
    var countlast = 0;
    
    for(var i = 0; i < this.pieces.length; i++){
        if(this.pieces[i].color === this.piececolor){
            countlast++;
        }
    }
    
    if(countlast > 0){
        return {win : false , pieces : countlast , inhouse : 15 - countlast};
    }else{
        return {win : true , pieces : 0 , inhouse : 15};
    }
};

Game.prototype.sendReInvite = function(){
    this.self.reinvite = true;
    
    if(!this.enemy.reinvite){
        this.sendRequest('reinvitePlayer' , {});
        this.setMessage ('Ожидание соперника...');
    }else{
        this.sendRequest('giveConfirmReInvate' , {});
    }
};

Game.prototype.getReInvite = function(){
    //console.log('Получен запрос приглашения переиграть');
    if(this.self.reinvite){
        this.acceptReInvite();
    }else{
        this.enemy.reinvite = true;
    }
};

Game.prototype.acceptReInvite = function(){
    //console.log('Отправляем подтверждение переиграть');
    this.sendRequest('giveConfirmReInvate' , {});
};

Game.prototype.actionDialog = function(type){
    var finish_dialog = $('#gamedialog');
    var self = this;
    
	
	switch (type) {
	    // показываем диалоговое окно победителю
	    case 'win':
	        console.info('open dialog win');
            finish_dialog.dialog({
                modal : false ,
                buttons : {
                    'Нет, выйти' : function(){
                        $(this).dialog('close');
                    } ,
                    'Да, начать новую игру' : function(){
                        $(this).dialog('close');
                        self.sendReInvite();
                    }
                } ,
                minWidth : 400
            });
        	        
            $('.ui-dialog-titlebar').remove();
        	        
            finish_dialog.html('Победа<br />Сеграть еще раз?');
            
            // закругляем игру
            this.endGame();
	        break;
	        
	    // показывеам окно проигравшему игроку
        case 'lose' :
            //console.log('Открываем окно проигрыша');
            finish_dialog.dialog({
                modal : false ,
                buttons : {
                    'Нет, выйти' : function(){
                        $(this).dialog('close');
                    } ,
                    'Да, начать новую игру' : function(){
                        $(this).dialog('close');
                        self.sendReInvite();
                    }
                } ,
                minWidth : 400
            });
        	        
            $('.ui-dialog-titlebar').remove();
        	        
            finish_dialog.html('Соперник победил.<br />Сыграть еще раз?');
            
            // закругляем игру
            //this.endGame();
	        break;
	    
	    default:
	        console.error('Undefined dialog type');
	}
};

Game.prototype.endGame = function(){
    // скрываем кости
    this.gamefinish = true;
    
    this.bones.hideBones();
    if(this.inhouse === 15){
        // блокируем фишки
        this.blockedPieces();
        // отправляем сопернику сообщение о конце игры
        this.sendRequest('sendLose' , {});
    }else{
        //console.log('Получена пометка о проигрыше');
        this.actionDialog('lose');
    }
};

Game.prototype.finishSteps = function(){
    var self = this;
    console.info('Закончился ход');
    this.setMessage('Передача хода');
    if(!this.endstep){
        // указываем, что ход завершился
        this.endstep = true;
        
        setTimeout(function() {
            self.setMessage('Ход соперника');
        }, 1000);
        
        this.blockedPieces();
        
        this.bones.lightControll(this.step.steps , true);
        this.bones.hideDop();
        
        // чистим иссторию ходов
        this.rules.history = [];
        
        // указываем, что сейчас ходит соперник
        this.step.player = 'enemy';
        // меняем сторону хода
        this.step.side   = (this.step.side === 'left') ? 'right' : 'left';
        // отрпавляем указание сопернику начать ход
        this.sendRequest('transferStepEnd' , {
            fields      : this.board.fields ,
            controll    : true}
        );
    }
};

Game.prototype.stepBegin = function(data){
    if('bones' in data){
        // меняем значение костей
        this.step.bones = data.bones;
        // указываем, что наш ход
        this.step.player = 'self';
        // меняем сторону хода
        this.step.side   = (this.step.side === 'left') ? 'right' : 'left';
        // перемещаем, взбалтываем и меняем значение костей
        this.bones.animateStepBones(data.bones , this.side);
        // удаляем указатель, что ход закончился
        this.endstep = false;
        // начинаем ход
        this.letsRock();
    }else{
        console.error('Получен запрос stepBegin, но необходимый параметр отсутствует');
    }
};

Game.prototype.takeBones = function(data){
    if('bones' in data){
        // сохраняем занчение костей
        this.step.bones = data.bones;
        // перемещаем, взбалтываем и меняем значение костей
        this.bones.animateStepBones(data.bones , this.enemy.side);
    }else{
        console.error('Получен запрос takeBones, но необходимый параметр отсутствует');
    }
};

Game.prototype.takeStep = function(data){
    switch (this.sendstep) {
        // если передается каждый ход по отдельности
        case 'every':
            // првереяем переданы ли все данные
            if('newfield' in data && 'pieceid' in data && 'steps' in data){
                // ищмем фишку
                var piece = this.getPiece(data.pieceid);
                
                // вычисляем предыдущее положение фишки
                var lastpos     = this.calcPiecePos(piece.id);
                
                /* если поля совпадают не перемещаем фишку */
                if(lastpos[0] !== data.newfield){
                
                    // удаляем идентификатор фишки из предыдущей позиции
                    this.board.fields[lastpos[0]].pieces.splice(lastpos[1] , 1);
                    
                    var field = this.transformEnemyStep(data.newfield);
                    
                    // если фишку переводят в дом
                    if(data.prehouse && field >= 13 && field <= 18){
                        field = 13;
                    }
                    
                    // вычисляем последнюю позици на поле
                    var pos     = this.board.calcLastFieldPos(field);
                    
                    // перемещаем идентификатор фишки
                    this.moveIdPiece(field , data.pieceid);
                    
                    if(data.house){
                        piece.house = true;
                        this.outPiece(piece , true);
                    }
                    
                    this.bones.lightControll(data.steps , false);
                    
                    // перемещаем фишку
                    piece.moveTo(pos.x , pos.y);
                    
                    //console.log('DATA SEND!!!!' , data);
                    
                    
                
                }
                
                // проверяем, все ли фишки находятся на своем месте
                this.checkPiecesPosition();
                
            }else{
                console.error('Переданы не все параметры для отображения хода' , data);
            }
            break;
        
        default:
            console.error('Передан неизвестный тип передачи ходов');
    }
};

/*
    # Поулченное перемещение фишки, необходимо преобразовать на текущее поле
    # т.к. у соперника поле отображается по другому
*/
Game.prototype.transformEnemyStep = function(field){
    if(field > 0 && field < 13){
        return 12 + field;
    }else{
        return field - 12;
    }
};


/*
    # Функция-процедура перебирает фишки и проверяет
    # корректны ли их координаты, и если они не корректны - то
    # перемещает их в нужную позицию
*/
Game.prototype.checkPiecesPosition = function(){
    // перебираем поля доски
    for(var fieldnum = 1; fieldnum < this.board.fields.length; fieldnum++){
        var field = this.board.fields[fieldnum];
        // если поле не пустое
        if(field.pieces.length !== 0){
            // перебираем идентификаторы фишек на данном поле
            for(var piecenum = 0; piecenum < field.pieces.length; piecenum++){
                // получаем объект фишки
                var piece = this.getPiece(field.pieces[piecenum]);
                // вычисляем текущее положение фишки
                var x = piece.obj.x();
                var y = piece.obj.y();
                
                // вычисляем положение, которое должно быть у фишки
                var needpos = this.board.calcPosCoords([fieldnum , piecenum]);
                
                // если координаты не совпадают
                if(needpos.x !== x || needpos.y !== y ){
                    //console.log('Фишка не на своем месте!' , fieldnum , piecenum , piece.id);
                    // перемещаем фишку в нужную позицию
                    piece.moveTo(needpos.x , needpos.y);
                }
            }
        }
    }
};


Game.prototype.setUndoClick = function(){
    var count_steps , _this , element;
    
    _this = this;
    element = $('#tbUndo');
    
    // кликаем на кнопку "ход назад"
    element.on('click' , function(){
        // количество ходов
        count_steps = _this.rules.history.length;
        
        // существуют ли сделанные ходы
        if(count_steps > 0){
            var last_step , last_new_field , last_old_field , last_id_piece ,
                last_piece , last_old_coords , movefield;
            
            // сохраняем последний шаг и распределяем его данные
            last_step       = _this.rules.history[count_steps - 1];
            last_new_field  = last_step.newfield;
            last_old_field  = last_step.oldfield;
            last_id_piece   = last_step.id;
            last_piece      = _this.getPiece(last_id_piece);
            
            // если фишка найдена
            if(last_piece){
                last_old_coords = _this.board.calcLastFieldPos(last_old_field);
                
                console.log('Coordinates last position: ' , last_old_coords);
                
                last_piece.moveTo(last_old_coords.x , last_old_coords.y);
                
                // вычисляем поле, на которое может сходить фишка
                // стоит костыль - 1 и 2 параметр ф-ии поменял местами
                // чтобы программа думала что я передвинул фишку назад
                movefield   =   _this.rules.calcMove(
                    last_new_field ,
                    last_old_field ,
                    last_piece.obj.id() ,
                    {clickboard : false , movemax : false}
                );
                
                // удаляем идентификатор фишки из предыдущей позиции
                var lastpos     = _this.calcPiecePos(last_id_piece);
                _this.board.fields[lastpos[0]].pieces.splice(lastpos[1] , 1);
                
                // если фишку перещаем в дом
                if(_this.rules.prehouse){
                    if(movefield >= 1 && movefield <= 6){
                        //console.log('TO HOUSE!!!!');
                        movefield = 1;
                        last_piece.house = true;
                    }
                }
                
                // перемещаем идентификатор фишки
                _this.moveIdPiece(movefield , last_id_piece);
                
                // удаляем созданное перемещение из истории и предыдущее
                _this.rules.history.splice(_this.rules.history.length - 2 , 2);
                
                // после завершения хода блокируем фишки, для новых расчетов
                _this.blockedPieces();
                _this.endDrag(last_piece);
                
            }
        }
    });
};

/*
    # Отрабатываем клики на фишке
*/
Game.prototype.setClicksPiece = function(node , oldfield){
    var pieceobj = this.getPiece(node.id());
    var self = this;
    var timer;
    
    // если фишка последняя в ряду, то ее можно выделять
    if(pieceobj.last){
    
    /*
    node.on('click' , function(){
        var node = this;
        if(timer) clearTimeout(timer);
        timer = setTimeout(function() {
            self.selectPiece(node);
        }, self.dblclicktime);
        
    });
    */
    
    // двойной клик по фишке перемещает фишку на минимальное значение
    node.on('dblclick' , function(){
        var node = this;
        
        clearTimeout(timer);
        
        var nowfield = self.calcPiecePos(node.id());
        
        // вычисляем поле, на которое может сходить фишка
        var movefield   =   self.rules.calcMove(
                                oldfield ,
                                nowfield[0] + 1 ,
                                node.id() ,
                                {clickboard : false , movemax : false}
                            );
                            
        // если фишку перетянули из дома
        // если фишку перетянули из дома
        if(oldfield === 1){
            if(self.rules.takehead.length === 2){
                var tmplast = self.getLastPieces(1 , 1);
                if(self.rules.takehead.indexOf(tmplast[0].id) !== -1){
                    self.rules.controllhead = true;
                }else{
                    self.rules.controllhead = false;
                }
            }else{
                self.rules.controllhead = false;            
            }        
        }
        
        // если фишку перещаем в дом
        if(self.rules.prehouse){
            if(movefield >= 1 && movefield <= 6){
                //console.log('TO HOUSE!!!!');
                movefield = 1;
                pieceobj.house = true;
            }
        }
        
        
        
        // удаляем идентификатор фишки из предыдущей позиции
        var lastpos     = self.calcPiecePos(node.id());
        self.board.fields[lastpos[0]].pieces.splice(lastpos[1] , 1);
        
        // вычисляем координаты поля на которое можно сходить
        var pos         = self.board.calcLastFieldPos(movefield);
        
        pieceobj.moveTo(pos.x , pos.y);
        
        // перемещаем идентификатор фишки
        self.moveIdPiece(movefield , node.id());
        
        // завершающие действия хода
        self.endDrag(pieceobj);
    });
    
    }
};

Game.prototype.addHistoryPieces = function(pieces){
    for(var i = 0; i < this.step.steps.length; i++){
        if(this.step.steps[i][1] !== 0){
            var have    = false;
            var hp      = this.step.steps[i][3];
            hp          = this.getPiece(hp);
            for(var n = 0; n < pieces.length; n++){
                if(hp.id === pieces[n].id){
                    have = true;
                }
            }
            if(!have){
                if(hp.field !== 1){
                    pieces.push(hp);
                }
            }
        }
    }
    
    return pieces;
};

/*
    # Осноавная функция перебирающая фишки для их активации
    # и создания дополнительных обработчиков
*/

Game.prototype.setDraggablePieces = function(pieces){
    var field;
    var self        = this;
    var next        = {};
    
    pieces = this.addHistoryPieces(pieces);
    
    // устанавливаем клики по доске
    //this.setClickBoard();
    
    // перебираем фишки для активации
    for(var i = 0; i < pieces.length; i++){
        
        // вычисляем поле, на котором расположена фишка
        field = this.calcPiecePos(pieces[i].id);
        field = field[0];
        
        if(this.rules.headRules(field , pieces[i].id)){
        
            if(pieces[i].id !== undefined){
                // вычисляем фишки, котороые расположены перед текущей
                next[pieces[i].id] = this.calcNextPieces(pieces[i].id);
                
                // перебираем вычесленные фишки и удаляем id текущей
                for(var n = 0; n < next[pieces[i].id].length; n++){
                    if(next[pieces[i].id][n].id === pieces[i].id){
                        next[pieces[i].id][n].last = true;
                        next[pieces[i].id].splice(n , 1);
                    }
                }
                
                // обрабатываем событие, которая перемещает фишки
                // которые расположены перед текущей, если перетягивать текущую
                pieces[i].obj.on('dragmove' , function(){
                    var node = this;
                    if(next[node.id()] !== undefined){
                        for(var m = 0; m < next[node.id()].length; m++){
                            next[node.id()][m].obj.x( node.x() );
                            if(field > 12){
                                if(self.board.startside === 'left'){
                                    // если фишки перетягиваются наверху
                                    next[node.id()][m].obj.y( node.y() + self.board.pieceheight * (m + 1));
                                }else{
                                    // фишки перетягиваются внизу
                                    next[node.id()][m].obj.y( node.y() - self.board.pieceheight * (m + 1));
                                }
                                
                            }else{
                                if(self.board.startside === 'left'){
                                    // фишки перетягиваются внизу
                                    next[node.id()][m].obj.y( node.y() - self.board.pieceheight * (m + 1));                                    
                                }else{
                                    // если фишки перетягиваются наверху
                                    next[node.id()][m].obj.y( node.y() + self.board.pieceheight * (m + 1));
                                }
                            }
                            
                        }
                    }
                    
                });
                
                this.setDraggable(pieces[i].obj , field);
            }
        }
    }
};


/*
    # Основаня дополнительная функци яотвечающая за активацию
    # дополнительного функционала для фишек
    #
*/
Game.prototype.setDraggable = function(piece , oldfield){
    var self        = this;
    var pieceobj    = this.getPiece(piece.id());
    // делаем фишку перетаскиваемой
    piece.draggable(true);
    
    piece.on('dragstart' , function(){
            pieceobj.oldpos = {x : this.x() , y : this.y()};
    });
    
    // событие после отпускания фишки, после её перетягивания
    piece.on('dragend' , function(){
        
        var x = this.x();
        var y = this.y();
        
        if(x === pieceobj.oldpos.x && y === pieceobj.oldpos.y){
            self.selectPiece(this);
        }else{
        
            var next = self.calcNextPieces(pieceobj.id);
                
            for(var i = 0; i < next.length; i++){
                self.movePiece(x , y , oldfield , next[i]);
            }
        
        }
        
        
    });
    
    // устанавливаем клики по фишке
    this.setClicksPiece(piece , oldfield);
    
};

Game.prototype.calcNextPieces = function(id){
    var pos     = this.calcPiecePos(id);
    var pieces  = this.board.fields[pos[0]].pieces;
    var next    = [];
    
    for(var i = pos[1]; i < pieces.length; i++){
        next.push(this.getPiece(pieces[i]));
    }
    
    return next;
};

Game.prototype.movePiece = function(x , y , oldfield , piece){
    var self  = this;
    var pos;
    var dopdata = {clickboard : false};
    
    if(oldfield > 7 && oldfield <= 11){        
	var modx = Math.abs(x - piece.oldpos.x);
    var mody = Math.abs(y - piece.oldpos.y);

    if(mody > modx){
		console.log('Перемещаем вниз');
        dopdata.movemax = true;
	}

		console.log('modx , mody: ' , modx , mody);
    }
    
    // вычисляем поле на котором остановилась фишка
    var newfield    = this.board.calcField(x , y);
        
    // вычисляем поле, на которое может сходить фишка
    var movefield   = this.rules.calcMove(oldfield , newfield , piece.id , dopdata);
    
    if(this.endstep){
        movefield = oldfield;
    }
    
    // если фишку перетянули из дома
    if(oldfield === 1){
        if(this.rules.takehead.length === 2){
            var tmplast = this.getLastPieces(1 , 1)
            if(this.rules.takehead.indexOf(tmplast[0].id) !== -1){
                this.rules.controllhead = true;
            }else{
                this.rules.controllhead = false;
            }
        }else{
            this.rules.controllhead = false;            
        }        
    }
    
    // если фишку перещаем в дом
    if(this.rules.prehouse){
        if(movefield >= 1 && movefield <= 6){
            //console.log('TO HOUSE!!!!');
            movefield = 1;
            piece.house = true;
        }
    }
    
    var lastpos     = this.calcPiecePos(piece.id);
    
    // если фишка возвращается на предыдущее поле
    if(movefield === oldfield){
        pos         = this.board.calcPosCoords(lastpos);
    // если фишка передвигается в новое поле
    }else{
        // удаляем идентификатор фишки из предыдущей позиции
        this.board.fields[lastpos[0]].pieces.splice(lastpos[1] , 1);
        // вычисляем координаты поля на которое можно сходить
        pos         = this.board.calcLastFieldPos(movefield);
        // перемещаем идентификатор фишки
        this.moveIdPiece(movefield , piece.id);
    }
        
    // перемещаем фишку
    piece.moveTo(pos.x , pos.y);
    
    if(piece.house){
        this.outPiece(piece , false);
    }
    
    if(movefield !== oldfield){
    
        // сохраняем поле на котором оказалась фишка
        piece.field = movefield;
    
        self.endDrag(piece);
    
    }
};

Game.prototype.outPiece = function(piece , enemy){
    console.error('OUT PIECE!');
    var pid = piece.id;
        var pos = false;
        for(var i = 0; i < this.pieces.length; i++){
            if(this.pieces[i].id === piece.id){
                pos = i;
            }
        }
        if(pos !== false){
            this.pieces.splice(pos , 1);
            
            var field = (enemy) ? 13 : 1;
            
            var serch = this.board.fields[field].pieces.indexOf(pid);
            if(serch !== -1){
                this.board.fields[field].pieces.splice(serch , 1);
            }
            
            if(piece.color === 'white'){
                $('#outwhite').append('<img src="images/pieces/white.png" />');
            }else{
                $('#outblack').append('<img src="images/pieces/black.png" />');
            }
            
            //console.log('enemy:' , enemy);
            
            if(!enemy){
                this.inhouse++;
                //console.log('inhouse' , this.inhouse);
            }
        }else{
            console.error('Dont finded piece!!!' , piece);
        }
}

Game.prototype.endDrag = function(piece){
    // убираем ярлык, что фишка послдняя в ряду,
    // для новых перерасчетов
    if(piece.last){
        piece.last = false;
    }
    
    // очищаем обработчики перемещения для новых расчетов
    for(var i = 0; i < this.pieces.length; i++){
        var node = this.pieces[i].obj;
        node.off('dragmove');
        node.off('dragend');
        node.off('click');
        node.off('dblclick');
    }
    
    this.board.mainlayer.off('click');
    
    this.unselectPiece();
    
    // после завершения хода блокируем фишки, для новых расчетов
    this.blockedPieces();
    
    
    
    if(!this.endstep){
        if(piece.house){
            // передаем ход
            this.giveStep(true);
        }else{
            // передаем ход
            this.giveStep(false);
        }
        
        this.bones.lightControll(this.step.steps , false);
        
        // проверяем, все ли фишки находятся на своем месте
        this.checkPiecesPosition();
        
        // пересчитываем и переактивируем новые фишки
        this.activatePieces();
    }
};

/*
    # Передача хода противнику
*/
Game.prototype.giveStep = function(house){
    switch(this.sendstep){
        // если необходимо передавать каждый ход
        case 'every':
            // отрпавляем данные хода
            if(this.step.send.length !== 0){
                //console.info('send data' , this.step.send)
                this.step.send[0].house = house;
                //if(!this.endstep){
                    this.sendRequest('transferStep' , this.step.send);
                //}
            }
            
            // очищаем данные хода
            this.step.send = [];
        break;
        
        // если необходимо передавать только конечные шаги
        case 'all':
        break;
        
        default:
            console.error('Передана неизвестная метка для передачи хода');
        break;
    }
};

/*
    # Одинарный клик по фишке, выделяет её
    # для дальнейшей манипуляции
*/
Game.prototype.selectPiece = function(piece){
    var self = this;
    
    console.info(this.selectedpiece);
    
    if(this.selectedpiece === false){
        select(piece , this);
        //this.setClickBoard();
        
    // если кликнули на ту же самую фишку - снимаем выделение
    }else if(this.selectedpiece.id() !== piece.id()){
        this.unselectPiece();
        select(piece , this);
        //this.setClickBoard();
    }else{
        select(piece , this);
    }
    
    function select(piece , obj){
        obj.selectedpiece = piece;
        
        piece.setImage(obj.imageObjects.light);
        
        obj.board.stage.batchDraw();
    }
};

/*
    # Проверяем и снимаем выделение с выделенной фишки
*/
Game.prototype.unselectPiece = function(){
    if(this.selectedpiece !== false){
	    if(this.piececolor === 'white'){
	        this.selectedpiece.setImage(this.imageObjects.white);
	    }else{
	        this.selectedpiece.setImage(this.imageObjects.black);
	    }
	    this.selectedpiece = false;
	    
	    this.board.stage.batchDraw();
	}else{
	    //console.log('Нет выделенных изображений');
	}
};

/*
    # отрабатываем клики по самой доске
*/
Game.prototype.setClickBoard = function(){
    var self = this;
    
    if(this.selectedpiece !== false){
        
    this.board.mainlayer.on('click' , function(){
        if(self.selectedpiece !== false){
            
            var selectedpos = self.calcPiecePos(self.selectedpiece.id());
            var piece = self.getPiece(self.selectedpiece.id());
            
            // получаем координаты курсора
            var mousePos = self.board.stage.getPointerPosition();
            
            // вычисляем поле на котором остановилась фишка
            var newfield    = self.board.calcField(mousePos.x , mousePos.y);
            
            // вычисляем поле, на которое может сходить фишка
            var movefield   =   self.rules.calcMove(
                                    selectedpos[0] ,
                                    newfield ,
                                    self.selectedpiece.id() ,
                                    {clickboard : true}
                                );
            
            
            // если фишку перетянули из дома
            if(selectedpos[0] === 1){
                if(self.rules.takehead.length === 2){
                    var tmplast = self.getLastPieces(1 , 1)
                    if(self.rules.takehead.indexOf(tmplast[0].id) !== -1){
                        self.rules.controllhead = true;
                    }else{
                        self.rules.controllhead = false;
                    }
                }else{
                    self.rules.controllhead = false;            
                }        
            }
            
            // если можно сходить по кликанному полю
            if(movefield !== false){
                // удаляем идентификатор фишки из предыдущей позиции
                var lastpos     = self.calcPiecePos(self.selectedpiece.id());
                self.board.fields[lastpos[0]].pieces.splice(lastpos[1] , 1);
                
                // если фишку перещаем в дом
                if(self.rules.prehouse){
                    if(movefield >= 1 && movefield <= 6){
                        //console.log('TO HOUSE!!!!');
                        movefield = 1;
                        piece.house = true;
                    }
                }
                
                // вычисляем координаты поля на которое можно сходить
                var pos         = self.board.calcLastFieldPos(movefield);
                
                // перемещаем идентификатор фишки
                self.moveIdPiece(movefield , self.selectedpiece.id());
                
                // перемещаем фишку
                piece.moveTo(pos.x , pos.y);
                
                piece.field = movefield;
                
                // после завершения хода блокируем фишки, для новых расчетов
                self.blockedPieces();
                
                // очищаем обработчик перемещения для новых расчетов
                //self.selectedpiece.off('dragend');
                
                self.endDrag(piece);
                
                //self.activatePieces();
            }else{
                self.setMessage("Невозможно сходить на данное поле");
                setTimeout(function() {
                    self.setMessage("Ваш ход");
                }, self.ruletimemes);
            }
        }
    });
    
    }//{console.log('not selected');} // if selectedpiece !== false;
};

/*
    # Функция проверяет сделан ли последний шаг
*/
Game.prototype.lastStep = function(canmove){
    var countcomplete = 0;
    
    for(var i = 0; i < this.step.steps.length; i++){
        if(this.step.steps[i][1] !== 0){
            countcomplete++;
        }
    }
    
    if(this.step.steps.length === 2){
        if(countcomplete === 2){
            // сходали на все кости
            return true;
        }else{
            return false;
        }
    }
    
    if(this.step.steps.length === 4){
        if(countcomplete === 4){
            return true;
        }else{
            return false;
        }
    }
};

Game.prototype.blockedPieces = function(){
    for(var i = 0; i < this.pieces.length; i++){
        this.pieces[i].obj.draggable(false);
        this.pieces[i].obj.off('click');
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
};

/*
    # Функция возвращает count количество последних фишек в поле field
*/
Game.prototype.getLastPieces = function(field , count){
    var result      = [];
    var controll    = true;
    var counter     = 1;
    var pieces      = this.board.fields[field].pieces;
    
    while(controll){
        if(pieces[pieces.length - counter] !== undefined){
            result.push(this.getPiece(pieces[pieces.length - counter]));
        }
        
        if(counter === count){controll = false;}
        counter++;
    }
    
    if(result.length !== 0){
        return result;
    }else{
        return false;
    }
};

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
           return false;
       }
    // если поле свободное
    }else{
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
    
    // исключение первого хода
    if(steps === 4){
        if(this.countsteps === 0){
            if(bone1 === 6 || bone1 === 4 || bone1 === 3){
                steps = 2;
            }
        }
    }
    
    var st = [];
    
    //st[ячейка очка] = [valbone , текущее поле , старое поле, id фишки]
    
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
    
    if(this.gamefinish){
        //console.log('gamefinish true!' , this.gamefinish);
        
        // на всякий случай очищаем данные об игре
        this.clearGame();
        this.gamefinish = false;
    }
    
    if(typeof(data) === 'object'){
        if(
                'id'         in data
            &&  'pieces'     in data
            &&  'bones'      in data
            &&  'lotbones'   in data
        ){
            if(
                data.id         !== undefined
                && data.pieces  !== undefined
                && data.bones   !== undefined
                && data.lotbones!== undefined
            ){
                console.log('Получены данные начала игры с сервера: ' , data);
                // Сохраняем значение костей для хода
                this.step.bones = data.bones;
                //this.step.bones = [2 , 2];
                //this.step.bones = [2 , 3];
                //this.step.bones = [1 , 5]; // block test
                //this.step.bones = [1 , 2];  // restep test
                //this.step.bones = [3 , 3];
                
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
    // меняем верхний отступ у костей дубля
    this.bones.changeDublePos();
    
    // если фишки должны всегда находиться в одном положении
    if(this.onepos){
        if(this.step.player === 'enemy'){
            this.bones.moveToSide(2 , this.enemy.side);
        }else{
            this.bones.moveToSide(2 , this.side);
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
    
    // осветляем на всякий случай
    $(this.bones.elements[0]).css('opacity' , 1);
    $(this.bones.elements[1]).css('opacity' , 1);
    $(this.bones.elements[2]).css('opacity' , 1);
    $(this.bones.elements[3]).css('opacity' , 1);
    
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

/*
    # Таймер обратного отсчета
*/
Game.prototype.countDown = function(callback , element ,second,endMinute,endHour,endDay,endMonth,endYear) {
    var self = this;
    var now = new Date();
    second = second || now.getSeconds();
    second = second + now.getSeconds();
    endYear =  endYear || now.getFullYear();            
    endMonth = endMonth ? endMonth - 1 : now.getMonth();   //номер месяца начинается с 0
    endDay = endDay || now.getDate();
    endHour = endHour || now.getHours() ;
    endMinute = endMinute || now.getMinutes();
    //добавляем секунду к конечной дате (таймер показывает время уже спустя 1с.) 
    var endDate = new Date(endYear,endMonth,endDay,endHour,endMinute,second+1); 
    this.timer = setInterval(function() { //запускаем таймер с интервалом 1 секунду
        var time = endDate.getTime() - now.getTime();
        if (time < 0) {                      //если конечная дата меньше текущей
            clearInterval(self.timer);
            alert("Неверная дата!");            
        } else {            
            var days = Math.floor(time / 864e5);
            var hours = Math.floor(time / 36e5) % 24; 
            var minutes = Math.floor(time / 6e4) % 60;
            var seconds = Math.floor(time / 1e3) % 60;  
            
            /*
            var digit='<div style="width:70px;float:left;text-align:center">'+
            '<div style="font-family:Stencil;font-size:65px;">';
            var text='</div><div>'
            var end='</div></div><div style="float:left;font-size:45px;">:</div>'
            document.getElementById('mytimer').innerHTML = '<div>осталось: </div>'+
            digit+days+text+'Дней'+end+digit+hours+text+'Часов'+end+
            digit+minutes+text+'Минут'+end+digit+seconds+text+'Секунд';
            */
            
            element.html('Ожидание ответа ' + seconds);
            
            if (!seconds && !minutes && !days && !hours) {              
                clearInterval(self.timer);
                
                callback();
            }           
        }
        now.setSeconds(now.getSeconds() + 1); //увеличиваем текущее время на 1 секунду
    }, 1000);
};

Game.prototype.loadImages = function(callback){
    var self = this;
    var imagesrcWhite    = 'images/pieces/white.png';
    var imagesrcBlack    = 'images/pieces/black.png';
    var imagesrcLight    = 'images/pieces/light.png';
    
    var whiteObj = new Image();
    var blackObj = new Image();
    var lightObj = new Image();
    
    whiteObj.onload = function(){
        self.imageObjects = {white : whiteObj , black : blackObj , light : lightObj};
        
        callback();
    };
    whiteObj.src = imagesrcWhite;
    blackObj.src = imagesrcBlack;
    lightObj.src = imagesrcLight;
}