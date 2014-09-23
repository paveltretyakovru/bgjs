/*
    # Договоренность с самим собой по переменным
    var int fieldnum    - номер поля
    var int pieceid     - идентификтаор фишек
    # Функции
    obj { int x , int y } calcLastFieldPos(int fieldnum) - вычисляет координаты свободного поля
*/

$(document).ready(function(){
    window.board    = new Board();
    window.rules    = new Rules();
    window.bones    = new Bones('.dice');
    window.socket   = new Socket();
    window.game     = new Game(window.board , window.rules , window.bones , window.socket); // УПРАВЛЯЮЩИЙ ОБЪЕКТ СИСТЕМЫ
    
    game.bones.changeSide(0 , 'left');
    game.bones.changeSide(1 , 'right');
    
    /*      ### Работа с сервером ###       */
    
    // регистрируемся на сервере
    window.game.registrOnServer({id : randomNumber(1 , 1000)});
    
    // получаем стартовые данные игры
    window.game.setListener('takeGameData' , 'Game' , 'takeGameData');
   
    // инициализируем игровую доску
    window.board.init();
    
    function randomNumber(min, max){
    	var rand = min - 0.5 + Math.random()*(max-min+1);
    	rand = Math.round(rand);
    	return rand;
    }
});