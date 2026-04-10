const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: 'bi-mat-cua-anh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.get('/', (req, res) => {
    const theme = req.cookies.theme || 'light';
    let statusMsg = req.session.username ? `Xin chào, ${req.session.username}` : "Bạn chưa đăng nhập";
    
    res.send(`
        <h1>Mini Profile App</h1>
        <p>Giao diện hiện tại: <b>${theme}</b></p>
        <p>Trạng thái: ${statusMsg}</p>
    `);
});

app.get('/set-theme/:theme', (req, res) => {
    const theme = req.params.theme;
    if (theme === 'light' || theme === 'dark') {
        res.cookie('theme', theme, { maxAge: 600000 });
        res.send(`Đã đổi sang theme ${theme}. Quay lại <a href="/">Trang chủ</a>`);
    } else {
        res.send("Chỉ chấp nhận light hoặc dark");
    }
});

app.get('/login', (req, res) => {
    res.send(`
        <form action="/login" method="POST">
            Username: <input type="text" name="username">
            <button type="submit">Đăng nhập</button>
        </form>
    `);
});
app.post('/login', (req, res) => {
    const { username } = req.body;
    if (username) {
        req.session.username = username;
        req.session.loginTime = new Date().toLocaleString();
        req.session.profileViews = 0;
        res.send(`Đăng nhập thành công! Đi tới <a href="/profile">Trang cá nhân</a>`);
    } else {
        res.send("Vui lòng nhập tên");
    }
});

app.get('/profile', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/login'); 
    }
    
    req.session.profileViews++;
    
    res.send(`
        <h1>Trang cá nhân</h1>
        <p>Username: ${req.session.username}</p>
        <p>Thời gian đăng nhập: ${req.session.loginTime}</p>
        <p>Số lần truy cập trang này: ${req.session.profileViews}</p>
        <a href="/logout">Đăng xuất</a>
    `);
});


app.get('/logout', (req, res) => {
    req.session.destroy(); 
    res.redirect('/login');
});

app.listen(3000, () => {
    console.log("Server đang chạy tại: http://localhost:3000");
});