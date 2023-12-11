import {Component} from 'react';
// var fs = require('fs');

export class FractoLocalCache extends Component {

   // static get_tile = (short_code) => {
   //    const level = short_code.length
   //    const prefix = level < 10 ? '0' : ''
   //    const filepath = `/public/package/L${prefix}${level}/${short_code}.gz`;
   //    try {
   //       fs.statSync(filepath).isFile();
   //    } catch (error) {
   //       console.log("file not available, path=" + filepath);
   //       return;
   //    }
   //    fs.readFile(filepath, function(err, buf) {
   //       console.log("filepath", filepath, buf)
   //    });
   // }
}

export default FractoLocalCache
