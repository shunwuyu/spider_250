'use strict';

var http = require('http'),
    https = require('https'),
    fs = require('fs'),
    path = require('path'),
    cheerio = require('cheerio');

// console.log('开始爬取网页了');

function spiderMovie(index) {
    console.log('页码:' + index);
    https.get('https://movie.douban.com/top250?start=' + index,function(res) {
        // console.log(res);
        var pageSize = 25;
        var html = '';
        var movies = [];
        res.setEncoding('utf-8');
        res.on('data', function(chunk) {
            html += chunk;
        })

        res.on('end', function() {
            // console.log(html);
            var $ = cheerio.load(html);
            $('.item').each(function() {
                var picUrl = $('.pic img',this).attr('src');
                var movie = {
                    title: $('.title',this).text(),
                    star: $('.info .star .rating_num', this).text(),
                    link:$('a',this).attr('href'),
                    picUrl:picUrl
                };
                if(movie) {
                    movies.push(movie);
                }
                downloadImg('./img/', movie.picUrl);
            });
            saveData('./data' + (index / pageSize) + '.json',movies);
        });
    });
}

function saveData(path, movies) {
    fs.writeFile(path, JSON.stringify(movies, null, ' '), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log('Data saved');
    })
}

//下载图片
function downloadImg(imgDir, url) {
    // console.log(url);
    https.get(url, function(res) {
        console.log(res);
        var data = '';
        res.setEncoding('binary');
        res.on('data', function(chunk) {
            data += chunk;
        });

        res.on('end', function() {
            fs.writeFile(imgDir + path.basename(url), data, 'binary', function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log('Image downloaded: ' , path.basename(url));
            });
        })
    }).on('error', function(err) {
        console.log(err);
    });
}


function *doSpider(x) {
    var start = 0;
    while(start < x) {
        yield start;
        spiderMovie(start);
        start += 25;
    }
}

for(var x of doSpider(250)) {
    console.log(x);
}
