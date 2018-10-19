// pages/chat/chat.js
var emoji = require("../../utils/emoji.js");
var webim = require('../../utils/webim_wx.js');

global.webim = webim;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: '',
    width: '',
    message: {},
    msg_num:0,
    message_input:'',
    emojis:{},
    show_emoji:'none',
    myname:'',
    myavatar:'',
    opponent:{},
    Identifier: null,
    UserSig: null,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          height: res.windowHeight,
          width: res.windowWidth,
        })
      }
    })
    //分享功能
    wx.showShareMenu({
      withShareTicket: true,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
    //表情数据
    emoji.emoji(this);
    //我的信息
    var myname = getApp().globalData.nickname;
    var myavatar = getApp().globalData.avatar;
    var myuid = getApp().globalData.uid;
    //对方信息
    var who = options.uid;
    var name = options.name;
    //设置title
    wx.setNavigationBarTitle({
      title: name
    })
    //请求对方数据
    var userdata = {
      'uid': who
    }
    wx.request({
      url: 'https://pythonup.cn/im/user-one',
      data: userdata,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function (res) {
        var user = res.data.data.user;
        that.setData({
          myname: myname,
          myavatar: myavatar,
          opponent: user,
        }) 
        //IM从这里开始了
        var identifier = myuid;
        wx.request({
          url: 'https://pythonup.cn/im/sig?identifier=' + identifier,
          method: 'GET',
          success: function (res) {
            var sig = res.data.data.sig;
            that.setData({
              Identifier: identifier,
              userSig: sig[0],
            })
            //当前用户身份
            var loginInfo = {
              'sdkAppID': getApp().globalData.sdkAppID,
              'appIDAt3rd': getApp().globalData.sdkAppID,
              'accountType': getApp().globalData.accountType,
              'identifier': identifier,
              'userSig': sig[0],
            };
            var listeners = {
              "onMsgNotify": function (msg) {
                var info = msg[0].elems[0].content.text;
                var fromWho = msg[0].fromAccount;
                var opponent = that.data.opponent.uid;
                console.log(fromWho);
                console.log(opponent);
                if (fromWho == opponent){
                  var data = {
                    'avatar': that.data.opponent.avatar,
                    'msg': info,
                    'time': '2018/10/15 13:30',
                    'type': 'left',
                  };
                  var msg_num = that.data.msg_num;
                  var msg_now = parseInt(msg_num) + 1;
                  var message = that.data.message;
                  message[msg_now] = data;
                  that.setData({
                    message: message,
                    msg_num: msg_now,
                  })
                }
              },
            };
            var options = {
              'isAccessFormalEnv': true,
              'isLogOn': false
            };
            webim.login(
              loginInfo, listeners, options,
              function (resp) {
                console.log(resp);
                //历史消息
                var Peer_Account = that.data.opponent.uid;
                var options = {
                  'Peer_Account': Peer_Account,
                  'MaxCnt': 5,
                  'LastMsgTime': 0,
                  'MsgKey': ''
                };
                webim.getC2CHistoryMsgs(
                  options,
                  function (resp) {
                    var MsgCount = resp.MsgCount;
                    if (MsgCount != 0){
                      var msgList = resp.MsgList;
                      console.log(msgList);
                      var oneMsg;
                      var oneWho;
                      var oneInfo;
                      //原始数据
                      var msg_num = that.data.msg_num;
                      var msg_now = parseInt(msg_num) + 1;
                      var message = that.data.message;  
                      for (var i = 0; i < msgList.length; i++) {
                        oneMsg  = msgList[i];
                        oneWho  = oneMsg.fromAccount;
                        oneInfo = oneMsg.elems[0].content.text;     
                        if (oneWho == Peer_Account){
                          var data = {
                            'avatar': that.data.opponent.avatar,
                            'msg': oneInfo,
                            'time': '2018/10/15 13:30',
                            'type': 'left',
                          };
                        }else {
                          var data = {
                            'avatar': that.data.myavatar,
                            'msg': oneInfo,
                            'time': '2018/10/15 13:30',
                            'type': 'right',
                          };
                        }
                        message[msg_now] = data;
                        msg_now += 1;
                      }
                      that.setData({
                        message: message,
                        msg_num: msg_now,
                      })
                    }
                  },
                  function (err) {
                    console.log(err);
                  }
                );
              },
              function (err) {
                console.log(err);
              }
            );
          }
        }); 
      }
    }); 
  },
  //打开表情
  emoji: function () {
    this.setData({
      show_emoji: 'block',
    })
  },
  //关闭表情
  shut: function () {
    this.setData({
      show_emoji: 'none',
    })
  },
  //选择表情
  choose_emoji: function (event) {
    var unicode = event.target.dataset.id;
    console.log(unicode);
  },
  //发送消息
  sendMsg: function (e) {
    var msg = e.detail.value.msg;
    if (msg == ''){
      return false;
    }
    var data = {
      'avatar': this.data.myavatar,
      'msg': msg,
      'time': '2018/10/15 13:30',
      'type': 'right',
    };
    var msg_num = this.data.msg_num;
    var msg_now = parseInt(msg_num) + 1;
    var message = this.data.message;
    message[msg_now] = data;
    this.setData({
      message: message,
      msg_num: msg_now,
      message_input:'',
    })
    //IM走起
    this.imMsg(msg);
  },
  imMsg: function (msg){
    var msgtosend = msg;
    var selToID = this.data.opponent.uid;
    var selType = webim.SESSION_TYPE.C2C;
    var isSend = true;
    var seq = -1;
    var random = Math.round(Math.random() * 4294967296);
    var msgTime = Math.round(new Date().getTime() / 1000);
    var subType = webim.C2C_MSG_SUB_TYPE.COMMON;
    var identifier = this.data.Identifier;
    var selSess, selSessHeadUrl;
    if (!selSess) {
      selSess = new webim.Session(selType, selToID, selToID, selSessHeadUrl, Math.round(new Date().getTime() / 1000));
    }
    var msg = new webim.Msg(selSess, isSend, seq, random, msgTime, identifier, subType);
    var text_obj = new webim.Msg.Elem.Text(msgtosend);
    msg.addText(text_obj);
    webim.sendMsg(msg, function (resp) {
      console.log(resp);
    }, function (err) {
      console.log(err);
    });
  },
  //获取表单id
  getid: function () {
    wx.navigateTo({
      url: '/pages/form/form',
    })
  }
})