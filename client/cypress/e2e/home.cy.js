// import posts from '../fixtures/posts.json'
context('New user', () => {
  describe("Homepage", () => {
    beforeEach(function () {
      localStorage.clear()
      cy.fixture('posts.json').then((posts) => {
        this.posts = posts
      })

      cy.intercept("GET", "/posts", {
        statusCode: 200,
        body: []
      }).as("getEmptyPosts")
      cy.visit('/')
      cy.getByTestId('memory-form').as("memoryForm")
      cy.getByTestId('posts').as("postContainer")
    })

    it('loads successfully', function () {
      cy.getByTestId('brand-name').contains(/memories/i)
      cy.get("@memoryForm").find('button[type="submit"]').should('be.visible');
      cy.get('@postContainer').should('be.visible')
        .findByTestId('posts-loading').should('be.visible');
    })

    it("Memory form", function () {
      const { createPost, allPosts, updatePost } = this.posts
      const [firstPost, secondPost] = allPosts
      cy.intercept("POST", "/posts", {
        statusCode: 200,
        body: createPost
      }).as("createPost")

      // create new memory
      cy.get('@memoryForm').findByName('creator').type(createPost.creator)
      cy.get('@memoryForm').findByName('title').type(createPost.title)
      cy.get('@memoryForm').find('textarea[name="message"]').type(createPost.message)
      cy.get('@memoryForm').findByName('tags').type(createPost.tags.join(','))
      cy.get('@memoryForm').find('input[type="file"]').selectFile(createPost.selectedFile)
      cy.get('@memoryForm').find('button[type="submit"]').click()

      // form should be empty
      cy.get('@memoryForm')
        .findByName('creator').should('have.value', '')
      cy.get('@memoryForm').findByName('title').should('have.value', '')
      cy.get('@memoryForm').find('textarea[name="message"]').should('have.value', '')
      cy.get('@memoryForm').findByName('tags').should('have.value', '')
      cy.get('@memoryForm').find('input[type="file"]').should('have.value', '')

      // test memory card
      cy.get('@postContainer').findByTestId(createPost._id).as("createPost")
      cy.get("@createPost").contains(createPost.title)
      cy.get("@createPost").contains(createPost.creator)
      cy.get("@createPost").contains(createPost.message)
      cy.get("@createPost").contains(createPost.tags.map(el => `#${el}`).join(' '))

      const updatedAllPosts = [...allPosts, createPost]
      cy.intercept("GET", "/posts", function (req) {
        delete req.headers['if-none-match']
        return req.reply(updatedAllPosts)
      }).as("getPosts")

      // last created card
      cy.get("@createPost").findByTestId('edit').click()
      cy.get('@memoryForm').findByName('creator').should('have.value', createPost.creator)
      cy.get('@memoryForm').findByName('title').should('have.value', createPost.title)
      cy.get('@memoryForm').find('textarea[name="message"]').should('have.value', createPost.message)
      cy.get('@memoryForm').findByName('tags').should('have.value', createPost.tags.join(','))

      // click on first post
      cy.get("@postContainer").findByTestId(firstPost._id).as("firstPost")
      cy.get("@firstPost").findByTestId('edit').click()
      cy.get('@memoryForm').findByName('creator').should('have.value', firstPost.creator)
      cy.get('@memoryForm').findByName('title').should('have.value', firstPost.title)
      cy.get('@memoryForm').find('textarea[name="message"]').should('have.value', firstPost.message)
      cy.get('@memoryForm').findByName('tags').should('have.value', firstPost.tags.join(','))


      // click on second post
      cy.getByTestId('posts').findByTestId(secondPost._id).as("secondPost")
      cy.get("@secondPost").findByTestId('edit').click()
      cy.get('@memoryForm').findByName('creator').should('have.value', secondPost.creator)
      cy.get('@memoryForm').findByName('title').should('have.value', secondPost.title)
      cy.get('@memoryForm').find('textarea[name="message"]').should('have.value', secondPost.message)
      cy.get('@memoryForm').findByName('tags').should('have.value', secondPost.tags.join(','))

      // edit first post
      cy.log(`update id ${updatePost._id}`)
      cy.log(`first id ${firstPost._id}`)
      cy.intercept("PATCH", "/posts/*", (req) => {
        delete req.headers["if-none-match"]
        return req.reply({ ...updatePost, _id: firstPost._id })
      }).as("updatePost")
      cy.get("@firstPost").findByTestId('edit').click()
      cy.get("@memoryForm").findByName('creator').click().clear().type(updatePost.creator)
      cy.get("@memoryForm").findByName('title').click().clear().type(updatePost.title)
      cy.get("@memoryForm").find('textarea[name="message"]').click().clear().type(updatePost.message)
      cy.get("@memoryForm").findByName('tags').click().clear().type(updatePost.tags.join(','))
      cy.get("@memoryForm").find('input[type="file"]').selectFile(updatePost.selectedFile)
      cy.intercept("GET", "/posts", function (req) {
        delete req.headers['if-none-match']
        return req.reply([{ ...updatePost, _id: firstPost._id }, { ...secondPost }, { ...createPost }])
      }).as("getUpdatedPosts")
      cy.get("@memoryForm").find('button[type="submit"]').click()
      cy.wait("@getUpdatedPosts")
      cy.wait("@updatePost")
      cy.get("@firstPost").contains(updatePost.title)
      cy.get("@firstPost").contains(updatePost.creator)
      cy.get("@firstPost").contains(updatePost.message)
      cy.get("@firstPost").contains(updatePost.tags.map(el => `#${el}`).join(' '))
    })

    it("memory form validation", function () {
      // empty form submit
      cy.getByTestId('memory-form').as("memoryForm")
      cy.get('@memoryForm').find('button[type="submit"]').click()
      cy.get('@memoryForm').contains('Please add required fields')
      cy.get('@memoryForm').contains('Creator is required')
      cy.get('@memoryForm').contains('Message is required')
      cy.get('@memoryForm').contains('Title is required')
      cy.get('@memoryForm').contains('Image is required')
    })

    it("Clear memory form", function () {
      const { createPost } = this.posts
      cy.getByTestId('memory-form').as("memoryForm")
      cy.get('@memoryForm').findByTestId('memory-form-clear').click()
      cy.get('@memoryForm').findByName('creator').should('have.value', '')
      cy.get('@memoryForm').findByName('title').should('have.value', '')
      cy.get('@memoryForm').find('textarea[name="message"]').should('have.value', '')
      cy.get('@memoryForm').findByName('tags').should('have.value', '')
      cy.get('@memoryForm').find('input[type="file"]').should('have.value', '')

      cy.get('@memoryForm').get('input[type="file"]').selectFile(createPost.selectedFile)
      cy.get('@memoryForm').findByName('title').type(createPost.title)
      cy.get('@memoryForm').find('textarea[name="message"]').type(createPost.message)
      cy.get('@memoryForm').getByTestId('memory-form-clear').click()
      cy.get('@memoryForm').findByName('title').should('have.value', '')
      cy.get('@memoryForm').find('textarea[name="message"]').should('have.value', '')
      cy.get('@memoryForm').find('input[type="file"]').should('have.value', '')
    })

    it("tags should be trimmed", function () {
      const { trimTags } = this.posts
      cy.intercept("POST", "/posts", (req) => {
        const trimmedTags = trimTags.tags.filter(Boolean).map((el) => el.trim())
        expect(req.body.tags).to.deep.equal(trimmedTags)
        return req.reply({ ...trimTags, tags: req.body.tags })
      }).as("createPostReq")

      cy.get('@memoryForm').findByName('creator').type(trimTags.creator)
      cy.get('@memoryForm').findByName('title').type(trimTags.title)
      cy.get('@memoryForm').find('textarea[name="message"]').type(trimTags.message)
      cy.get('@memoryForm').findByName('tags').type(trimTags.tags.join(','))
      cy.get('@memoryForm').find('input[type="file"]').selectFile(trimTags.selectedFile)
      cy.get('@memoryForm').find('button[type="submit"]').click()
      cy.wait("@createPostReq")
      cy.get("@postContainer").findByTestId(trimTags._id).as("trimPost")
      cy.get("@trimPost").contains(trimTags.tags.filter(Boolean).map(el => `#${el.trim()}`).join(' '))
    })
  })
})

context("Existing user", () => {
  describe("Homepage", function () {
    beforeEach(function () {
      localStorage.clear()
      cy.fixture('posts.json').then((posts) => {
        this.posts = posts
        cy.intercept("GET", "/posts", {
          statusCode: 200,
          body: posts.allPosts
        }).as("getAllPosts")
      })

      cy.visit('/')
      cy.wait("@getAllPosts")
      cy.getByTestId('memory-form').as("memoryForm")
      cy.getByTestId('posts').as("postContainer")
    })

    it('loads successfully', function () {
      cy.get('@postContainer').should('be.visible')
      cy.get('@postContainer').findByTestId('posts-loading').should('not.exist');
      cy.get('@postContainer').should('be.visible')
      cy.get('@postContainer').findByTestId('posts-content').should('be.visible')
        .children().should('have.length', 2);
    })

    it("delete memory form", function () {
      const { allPosts } = this.posts
      cy.intercept("DELETE", "/posts/*", (req) => {
        delete req.headers["if-none-match"]
        return req.reply({ message: "post deleted successfully" })
      }).as("deletePost")

      cy.get('@postContainer').findByTestId(allPosts[0]._id).findByTestId('delete').click()
      cy.wait("@deletePost")
      cy.get('@postContainer').findByTestId(allPosts[0]._id).should('not.exist')
      cy.get('@postContainer').findByTestId('posts-content')
        .children().should('have.length', 1);
      cy.get('@postContainer').findByTestId(allPosts[1]._id).findByTestId('delete').click()
      cy.wait("@deletePost")
      cy.get('@postContainer').findByTestId('posts-content').should('not.exist')
      cy.get('@postContainer').findByTestId(allPosts[1]._id).should('not.exist')
    })

    it("like memory form", function () {
      const { allPosts, createPost } = this.posts
      const [firstPost, secondPost] = allPosts
      const postList = [{ ...firstPost }, { ...secondPost }, { ...createPost }]
      const aliasList = ["@firstPost", "@secondPost", "@createPost"]

      const getRandomIdx = function () {
        const randomIdx = Math.floor(Math.random() * 3)
        return randomIdx
      }

      cy.intercept("POST", "/posts", {
        statusCode: 200,
        body: createPost
      }).as("createPost")

      // create new memory
      cy.get('@memoryForm').findByName('creator').type(createPost.creator)
      cy.get('@memoryForm').findByName('title').type(createPost.title)
      cy.get('@memoryForm').find('textarea[name="message"]').type(createPost.message)
      cy.get('@memoryForm').findByName('tags').type(createPost.tags.join(','))
      cy.get('@memoryForm').find('input[type="file"]').selectFile(createPost.selectedFile)
      cy.get('@memoryForm').find('button[type="submit"]').click()

      cy.get('@postContainer').findByTestId(firstPost._id).as("firstPost")
      cy.get('@postContainer').findByTestId(secondPost._id).as("secondPost")
      cy.get('@postContainer').findByTestId(createPost._id).as("createPost")
      let likeTest = 0
      while (likeTest < 10) {
        const randomIdx = getRandomIdx()
        const post = postList[randomIdx]
        const alias = aliasList[randomIdx]
        const { likeCount } = post
        cy.log(`Selected alias:${alias}, idx:${randomIdx}, id:${post._id},  like:${likeCount}, Iteration: ${likeTest + 1}`)
        postList[randomIdx].likeCount = likeCount + 1
        cy.intercept("PATCH", `/posts/${post._id}/likePost`, (req) => {
          delete req.headers["if-none-match"]
          return req.reply({ ...post, likeCount: likeCount + 1 })
        }).as("likePost")
        cy.get(alias).findByTestId('like').should('contain', `Like ${likeCount}`).click()
        cy.wait("@likePost")
        cy.get(alias).findByTestId('like').should('contain', `Like ${likeCount + 1}`)
        likeTest += 1
      }
    })
  })
})

