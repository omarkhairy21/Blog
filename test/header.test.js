const puppeteer = require('puppeteer');

let browser, page;

beforeEach(async () => {
   browser = await puppeteer.launch({
    headless: false
  });
  page = await browser.newPage();
  await page.goto('localhost:3000');
  // page.deleteCookie({name: 'session'}).then( () => {
  // page.deleteCookie({name: 'session.sig'})
  // }).then(() => {
  //   console.log('All Cookies Deleted');
  // })
});

afterEach(async ()=> {
   await browser.close();
})

test('We can Lunch a browser', async () => {
  const text = await page.$eval('a.brand-logo', el => el.innerHTML);

  expect(text).toEqual('Blogster');
});

test('clicking login starts oauth flow', async () => {
  await page.click('.right a');
  const url = await page.url();
  console.log(url);
  expect(url).toMatch(/accounts\.google\.com/)
});

test.only('When signed in, shows logout button', async () => {
  const id = '5da4c354b9349c2e9c74f654';

  const Buffer = require('safe-buffer').Buffer;

  const sessionObject = {
    passport: {
      user: id
    }
  }

  const sessionString = Buffer.from(
    JSON.stringify(sessionObject)
  ).toString('base64'); 

  const Keygrip = require('keygrip');
  const keys = require('../config/keys');
  const keygrip = new Keygrip([keys.cookieKey]);
  const sig = keygrip.sign('express:sess=' + sessionString);
  await page.setCookie({name:'express:sess', value: sessionString});
  await page.setCookie({name: 'express:sess.sig' , value: sig});

  await page.goto('http://localhost:3000');
  await page.waitFor('a[href="/auth/logout"]');
  const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

  expect(text).toEqual('Logout');
})