const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

/**
 *     const cachedBlogs = await client.get(req.user.id);
    if(cachedBlogs){
      console.log('Serveing from cach');
       return res.send( JSON.parse(cachedBlogs));
    }

        client.set(req.user.id, JSON.stringify(blogs));
    console.log('Serving from Mongo');
 */
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options ={} ){
  // this refer to query instance 
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');

  return this;
}

mongoose.Query.prototype.exec = async function(){

  if(!this.useCache){
    return exec.apply(this, arguments)
  }

  console.log('I am To Run A Query');


  const key = JSON.stringify( Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }));
  console.log( this.mongooseCollection.name);
  console.log(this.getQuery());
  console.log('key', key)
  // See If we have a value for 'Key' in redis
  const cacheValue = await client.hget(this.hashKey, key);

  // If we do, return that 
  if(cacheValue){
    console.log('cached Value ' + cacheValue);
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }
  // Otherwise, issue the query and store the result in redis 
  const result = await exec.apply(this, arguments);

  client.hset(this.hashKey, JSON.stringify(result), 'EX', 10);

  return result;
}

module.exports = {
  clearHash(hashKey){
    client.del(JSON.stringify(hashKey));;
  }
}