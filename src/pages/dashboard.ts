import Dashboard from '../templates/dashboard.html'
import SubmitButton from '../components/SubmitButton.html'
import InputName from '../components/InputName.html'
import InputAge from '../components/InputAge.html'

export default {
  template: Dashboard,
  components: {
    SumbitButton: SubmitButton,
    ClientNameInput: InputName,
    ClientAgeInput: InputAge
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
