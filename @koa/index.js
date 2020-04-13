const Koa = require('koa');
const app = new Koa();
const static = require('koa-static');
const path = require('path')
const router = require('koa-router')()

app.use(static(path.resolve(__dirname, './static')));

router.get('/json', async (ctx, next) => {
    ctx.response.body = `1111`;
});

app.listen(3000);