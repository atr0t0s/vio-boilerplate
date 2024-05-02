import SubmitButton from '../templates/components/SubmitButton.html'

export default {
  template: SubmitButton,
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
