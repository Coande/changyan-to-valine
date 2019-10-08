const fs = require('fs');

const INPUTFILE = 'data/changyan-raw.json';
const OUTPUTFILE = 'data/changyan-valine.json';
const STARTDATE = new Date(0);
const jsonData = JSON.parse(fs.readFileSync(INPUTFILE));


let jsonResult = [];

// 获取评论根节点
function getRComment(comment) {
  if (!comment.reply_id) {
    return comment;
  }
  let pComment = comment;
  jsonData.forEach(topic => {
    topic.comments.forEach(item => {
      if (item.comment_id == comment.reply_id) {
        pComment = item;
      }
    });
  });
  return getRComment(pComment);
}

// 获取 @人 的字符串
function getAtMan(pid) {
  if (!pid) {
    return;
  }
  let atMan;
  jsonData.forEach(topic => {
    topic.comments.forEach(item => {
      if (item.comment_id == pid) {
        const nickname = item.passport.nickname;
        const comment_id = item.comment_id;
        atMan = `<a class="at" href="#${comment_id}">@${nickname} </a> , `
      }
    });
  });
  return atMan;
}

jsonData.forEach(topic => {
  topic.comments.forEach(item => {

    const pathname = decodeURIComponent(new URL(topic.topic_url).pathname);
    const rComment = getRComment(item);
    const rid = rComment.comment_id === item.comment_id ? undefined : rComment.comment_id;

    const pid = item.reply_id ? item.reply_id.toString() : undefined;
    let atMan = getAtMan(pid);
    const comment = atMan ? atMan + item.content : item.content;

    jsonResult.push({
      objectId: item.comment_id,
      nick: item.passport.nickname,
      ACL: {
        '*': {
          read: true
        }
      },
      mail: undefined,
      insertedAt: {
        __type: 'Date',
        iso: new Date(item.create_time).toISOString()
      },
      pid,
      link: undefined,
      comment,
      url: pathname,
      rid:  rid ? rid.toString() : undefined,
      ip: item.ip,
      createdAt: {
        __type: 'Date',
        iso: new Date(item.create_time).toISOString()
      },
      updatedAt: {
        __type: 'Date',
        iso: new Date(item.create_time).toISOString()
      }
    });
  });
});

// 只需要某个时间之后的评论
jsonResult = jsonResult.filter(item => new Date(item.createdAt.iso).getTime() > STARTDATE.getTime());

fs.writeFileSync(OUTPUTFILE, JSON.stringify(jsonResult, null, 2));
console.log('转换后的文件已输出到：', OUTPUTFILE)