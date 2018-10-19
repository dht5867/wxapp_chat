// pages/index/index.js
var userTool = require("../../utils/userinfo.js");
Page({
  data: {
    height: '',
    width: '',
    users:{},
    auth:false,
    show_auth:'none',
  },
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          height: res.windowHeight,
          width: res.windowWidth
        })
      }
    })
    //登录
    wx.login({
      success: function (res) {
        if (res.code) {
          //请求服务器
          var postdata = {
            code: res.code,
          };
          //获取数据
          wx.request({
            url: 'https://pythonup.cn/im/auth',
            data: postdata,
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: function (res) {
              var server = res.data.data;
              getApp().globalData.openid = server.openid;
              getApp().globalData.uid = server.uid;
              //用户授权
              wx.getSetting({
                success: res => {
                  if (res.authSetting['scope.userInfo']) {
                    //获取用户信息
                    wx.getUserInfo({
                      success: function (res) {
                        var raw = JSON.parse(res.rawData);
                        var userdata = {
                          'uid': server.uid,
                          'nickname': raw.nickName,
                          'avatar': raw.avatarUrl,
                        }
                        //全部用户属性设置
                        getApp().globalData.nickname = raw.nickName;
                        getApp().globalData.avatar = raw.avatarUrl;
                        that.setData({
                          auth: true
                        })
                        //更新用户信息
                        userTool.updateUserinfo(userdata);
                        //获取名片列表
                        userTool.getUserList(server.uid, that);
                      }
                    })
                  } else {
                    that.setData({
                      auth: false,
                      show_auth: 'block'
                    })
                  }
                }
              })
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
    //分享功能
    wx.showShareMenu({
      withShareTicket: true,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //开始唠嗑
  chat: function (event) {
    var uid = event.target.dataset.uid;
    var name = event.target.dataset.name;
    wx.navigateTo({
      url: '/pages/chat/chat?uid=' + uid+'&name='+name,
    })
  },
  //授权获取用户信息
  getUserInfo:function(){
    var that = this;
    wx.authorize({
      scope:'scope.userInfo',
      success: function (res) {
        wx.getUserInfo({
          success: function (res) {
            var raw = JSON.parse(res.rawData);
            //全部用户属性设置
            getApp().globalData.nickname = raw.nickName;
            getApp().globalData.avatar = raw.avatarUrl;
            that.setData({
              auth: true,
              show_auth: 'none'
            })
            that.onLoad();
          }
        })
      }
    })
  }
})