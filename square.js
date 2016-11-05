function hello() {
  var player = document.createElement('div');
  player.id = 'player';
//  console.log('hello i am in the browser');
  $("body").append(player);
}

hello();
