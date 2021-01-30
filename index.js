const express = require ('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Blog = require('./models/bloghere');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const ExpressError = require('./utilis/ExpressError');
const CatchAysnc = require('./utilis/catchAsync');
const {BlogSchema} = require('./schemas');

app.engine('ejs',engine);
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

mongoose.connect('mongodb://localhost:27017/bloghere',{
        useNewUrlParser:true,
        useCreateIndex : true,
        useUnifiedTopology:true
    });
    const db=mongoose.connection;
    db.on('error',console.error.bind(console,"Connection Error"));
    db.once("open",()=>{
        console.log("Database Connected")
    });

const validateBlog = (req,res,next)=>{
    const{error} = BlogSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
}

app.get('/',async(req,res)=>{
    const blog= await Blog.find({});
    res.render('index',{blog});
});
app.get('/new',async(req,res)=>{
    res.render('new')
});
app.post('/',validateBlog,CatchAysnc(async(req,res,next)=>{
    const blog = new Blog(req.body);
    await blog.save()
    res.redirect(`/${blog._id}`); 
}));
app.get('/:id',CatchAysnc(async(req,res,next)=>{
    const{id} = req.params;
    const blog = await Blog.findById(id);
    res.render('show',{blog})
}))
app.get('/:id/edit',CatchAysnc(async(req,res)=>{
    const{id} = req.params;
    const blog = await Blog.findById(id);
    res.render('edit',{blog})
}))
app.put('/:id',validateBlog,CatchAysnc(async(req,res)=>{
    const{id} = req.params; 
    const blog= await Blog.findByIdAndUpdate(id,req.body,{runValidators:true,new:true});
    res.redirect(`/${blog._id}`)
}))
app.delete('/:id',CatchAysnc(async(req,res)=>{
    const{id} = req.params;
    const blog= await Blog.findByIdAndDelete(id);
    res.redirect(`/`);
}))
app.all('*',(req,res,next)=>{
    next(new ExpressError('Page not found',404))
})
app.use((err,req,res,next)=>{
    const {status = 500} = err;
    if(!err.message) err.message = 'Oh no Something went wrong';
    res.status(status).render('error',{err})
})
app.listen(3000,()=>{
    console.log("Server Starting on port 3000!!")
});