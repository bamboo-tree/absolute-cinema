const router = require('express').Router()


router.post("/test", async (req, res) => {
  try {
    res.status(200).send({ message: "Works" })
    console.log("Test successful")
  } catch (error) {
    console.error("Error while performing test")
    res.status(500).send({ message: "Internal Server Error" })
  }
})

module.exports = router