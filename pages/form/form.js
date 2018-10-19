// pages/form/form.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
  },

  formSubmit: function (e) {
    var that = this;
    var formId = e.detail.formId;
    var postdata = {
      'formid': formId,
      'openid': getApp().globalData.openid
    }
    console.log(postdata);
    wx.request({
      url: 'https://pythonup.cn/im/formid',
      data: postdata,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function (res) {
        var raw = res.data;
        console.log(raw);
      }
    })
  }
})