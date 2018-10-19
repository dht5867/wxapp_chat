function updateUserinfo(userdata){
  //更新用户信息
  wx.request({
    url: 'https://pythonup.cn/im/user-info',
    data: userdata,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    success: function (res) {
      var raw = res.data.data;
    }
  })
}

function getUserList(uid, that) {
  var userdata = {
    'uid': uid
  }
  //获取用户列表
  wx.request({
    url: 'https://pythonup.cn/im/user-list',
    data: userdata,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    success: function (res) {
      var raw = res.data.data;
      that.setData({
        users: raw
      })
    }
  })
}

module.exports = {
  updateUserinfo: updateUserinfo,
  getUserList: getUserList
}
