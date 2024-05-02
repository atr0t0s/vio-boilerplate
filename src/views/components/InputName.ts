import InputName from '../templates/components/InputName.html'

export default {
  template: InputName,
  methods: {
    test() {
      console.log("testng 1")
    },
    test2() {
      console.log("testing 2")
    },
  },
  mount() {
    this.test()
  }
}
