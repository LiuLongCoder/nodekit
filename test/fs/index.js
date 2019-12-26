const FS = require('fs')
const Path = require('path')
const _ = require('lodash')
const dirPath = 'F:\\opencv研习社'

// openCV Demo 用来创建文件夹
function mkDirDays () {
  let myDirPath = Path.join(dirPath, 'days')
  for (let i = 1; i < 200; i++) {
    console.log(Path.join(myDirPath, '' + i))
    const dayDirPath = Path.join(myDirPath, '' + i)
    FS.mkdirSync(dayDirPath, { recursive: true })
  }
}

// 保存MP3和代码的时候放在了文档中，批量移动到指定文件中
function moveOpenCVFiles () {
  let prePath = 'F:/Users/Martin/Documents/'
  const destPath = 'F:/opencv研习社/days'
  for (let idx = 100; idx < 110; idx++) {
    let fileName = 'OpenCV-day-' + idx + '.mp3'
    let filePath = prePath + fileName
    FS.stat(filePath, (err, stat) => {
      if (err) {
        console.log(err)
      } else {
        console.log(stat.isFile())
        let destFilePath = Path.join(destPath, '' + idx, fileName)
        FS.copyFileSync(filePath, destFilePath)
        FS.unlinkSync(filePath)
      }
    })
    console.log('>>>>> end ' + idx)
  }
}

function copyFilesTest () {
  const destPath = 'F:/opencv研习社/days'
  for (let i = 100; i < 121; i++) {
    let srcDirPath = Path.join(destPath, '' + i)
    let mp3FileName = 'OpenCV-day-' + i + '.mp3'
    let zipFileName = 'code_' + i + '.zip'
    let mp3FilePath = Path.join(srcDirPath, mp3FileName)
    let zipFilePath = Path.join(srcDirPath, zipFileName)
    let mp3DstPath = Path.join(destPath, mp3FileName)
    let zipDstPath = Path.join(destPath, zipFileName)
    try {
      FS.copyFileSync(mp3FilePath, mp3DstPath)
      FS.copyFileSync(zipFilePath, zipDstPath)
    } catch (e) {
      console.log(e)
    }
  }
}

// 罗列opencv中的pdf文件
async function showAllOpenCVFiles () {
  let content = ''
  const dirPath = 'F:/Users/Martin/Downloads/百度网盘下载/400'
  try {
    const dirStat = FS.statSync(dirPath)
    if (dirStat.isDirectory()) {
      let files = FS.readdirSync(dirPath)
      for (let key in files) {
        console.log(files[key])
        let oneItem = '[' + files[key] + '](http://liulong.site/opencv/doc/' + encodeURIComponent(files[key]) + ')'
        content = content + oneItem + '\r\n'
      }
      console.log(files.length)
    }

    FS.writeFileSync('D:/opencvPDF.txt', content)
  } catch (e) {
    console.log(e)
  }
}

let globalCount = 0
// opencv 把c++代码移出来
async function copyOpenCVCode () {
  const openCVPath = 'F:/DeveloperProject/opencv/opencv-4.1.1/modules'
  const dirPath = 'D:/opencvcode'
  let folders = ''
  try {
    const dirStat = FS.statSync(openCVPath)
    if (dirStat.isDirectory()) {
      let files = FS.readdirSync(openCVPath)
      for (let idx in files) {
        let fileName = files[idx]
        folders = fileName
        let modulePath = Path.join(openCVPath, fileName)
        if (FS.statSync(modulePath).isDirectory()) {
          const subFiles = FS.readdirSync(modulePath)
          for (let subIdx in subFiles) {
            let subFileName = subFiles[subIdx]
            if (subFileName === 'src') {
              folders = folders + '/' + subFileName
              console.log('>>> globalCount: ', globalCount)
              mxrCopy(Path.join(modulePath, subFileName), Path.join(dirPath, folders))
            }
          }
        }
      }
    }
  } catch (e) {
    console.log('copyOpencvCode err: ', e)
  }
}

async function mxrCopy (src, dst) {
  return new Promise((resolve, reject) => {
    try {
      FS.stat(src, function (err, stat) {
        if (err) {
          console.log('mxr_copy err: ', err)
        } else {
          console.log('>>> globalCount: ', globalCount)
          globalCount++
          if (stat.isDirectory()) {
            console.log('go on ....')
            try {
              const dstStat = FS.statSync(dst)
              if (!dstStat.isDirectory()) {
                FS.mkdirSync(dst, { recursive: true })
              }
              const files = FS.readdirSync(src)
              for (let idx in files) {
                const fileName = files[idx]
                mxrCopy(Path.join(src, fileName), Path.join(dst, fileName))
              }
              resolve()
            } catch (e) {
              console.log('> get err: ', e)
              FS.mkdirSync(dst, { recursive: true })
              const files = FS.readdirSync(src)
              for (let idx in files) {
                const fileName = files[idx]
                mxrCopy(Path.join(src, fileName), Path.join(dst, fileName))
              }
              resolve()
            }
          } else if (stat.isFile()) {
            FS.copyFileSync(src, dst)
            resolve()
          }
        }
      })
    } catch (e) {
      console.log('mxr_copy', e)
      reject(e)
    }
  })
}

// copyOpenCVCode()

// 重命名
function testRename () {
  const jiaofuDirPath = 'F:\\MXR\\test\\教辅7年级'
  try {
    const dirStat = FS.statSync(jiaofuDirPath)
    if (dirStat.isDirectory()) {
      let files = FS.readdirSync(jiaofuDirPath)
      let idx = 1
      for (let key in files) {
        console.log(files[key])
        let oneItem = Path.join(jiaofuDirPath, files[key])
        let newName = Path.join(jiaofuDirPath, 'P' + _.padStart('' + idx, 2, '0') + '.jpg')
        console.log(newName)
        FS.renameSync(oneItem, newName)
        idx++
      }
      console.log(files.length)
    }
  } catch (e) {
    console.log(e)
  }
}

testRename()

