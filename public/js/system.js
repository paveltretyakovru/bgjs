/*
    # Договоренность с самим собой по переменным
    var int fieldnum    - номер поля
    var int pieceid     - идентификтаор фишек
    # Функции
    obj { int x , int y } calcLastFieldPos(int fieldnum) - вычисляет координаты свободного поля
*/

$(document).ready(function(){
    window.game     = new Game();
    window.board    = new Board();
    window.rules    = new Rules();
    window.pieces   = new Array();
    window.bones    = new Bones('.dice');
    
    $('#shakeButton').click(function(e){
        e.preventDefault();
        window.bones.shake();
    });
   
    // инициализируем игровую доску
    window.board.init();
    
    // создаем фишки+\
    switch(window.game.type){
        
        /*  
            ########     ########       ########    ########
            ####   Тип создания фишек для длинных нард  ####
            ########    ########        ########    ########
        */
        case 'long':
            for(var i = 0; i < 30; i++){
                var pieceid = i;
                if (i < 15){
                    // создаем объекты фишек
                    window.pieces[i] = new Piece( 'white' , pieceid , window.board.mainlayer , window.board.stage , 'left') ;
                    startPiecesPositions(window.pieces[i].obj , 1);
                }else{
                    window.pieces[i] = new Piece( 'black' , pieceid , window.board.mainlayer , window.board.stage , 'right') ;
                    startPiecesPositions(window.pieces[i].obj , 13);
                }
                
                window.pieces[i].obj.on('dragend' , function(){
                    console.log(this.id() , ' dragend');
                });
            }
            break;
        default : console.error("Передан неизвестный тип игры");
    }
    
    /*
        #
        # procedure startPiecesPositions(obj pieceobj , num fieldnum)
        # функция для стартового перемещения фишек
        #
    */
    
    function startPiecesPositions(pieceobj , fieldnum){
        var position = window.board.calcLastFieldPos(fieldnum);
        // перемещаем фишку
         pieceobj.x(position.x);
         pieceobj.y(position.y);
                
        // добавляем фишку на поле
        window.board.addPiece(pieceobj.id() , fieldnum);

    }
});