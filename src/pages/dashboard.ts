import Dashboard from '../templates/dashboard.html'
import ButtonComponent from '../components/Button.html'

export default {
  template: Dashboard,
  components: {
    Button: ButtonComponent
  },
  data: {
    pageName: "Dashboard",
    clientName: "",
    age: 0
  },
  binds: {
    submitButton: {
      event: "click",
      inputs: [{
        input: "ageInput",
        updates: "age"
      },
      {
        input: "clientNameInput",
        updates: "clientName"
      }],
    },
  },
  methods: {
    test(param: string) {
      console.log(param)
    },
    test2() {
      console.log("testing 2")
    }
  },
  mount() {
    this.methods.test2()
  }
}
