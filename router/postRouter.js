const router = require('express').Router();
const postController = require('../controllers/postController');
const requireMiddleware = require('../middleware/requireUser')


//router.get("/all", requireMiddleware,postController.getAllPostsController);
router.post("/", requireMiddleware,postController.createPostController);
router.post("/like", requireMiddleware,postController.likeAndUnlikePost);
router.put("/",requireMiddleware,postController.updatePostController);
router.delete("/", requireMiddleware,postController.deletePostController)

module.exports = router;