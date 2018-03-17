  var file1; 
  var file2; 
  var control;
  $('#file1').on('change',function(){
    file1 = this.files[0];    
    var html = [];
    html.push("<img style='width:100%;' src='"+file1+"'/>");
  });
  
  $('#file2').on('change',function(){
   file2 = this.files[0];
  });

$('button').on('click',function(){
  control = resemble(file1).compareTo(file2).onComplete(onComplete)
});

function onComplete(data){
  console.log(data);
  var html = [];
  html.push("<img style='width:100%;' src='"+data.getImageDataUrl()+"'/>");
  $('#diff').html(html.join(''));
}
$('igl').on('click',function(){
  control.ignoreLess();
});
$('igc').on('click',function(){
    control.ignoreColors();
});
