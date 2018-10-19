function emoji(that){
  var data = {};
  for (var i = 1; i < 36; i++) {
    data[i] = "../../images/emoji/"+i+".png";
  }
  console.log(data);
  that.setData({
    emojis: data
  })
}

module.exports = {
  emoji: emoji
}
