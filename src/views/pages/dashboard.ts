import DashboardPage from '../templates/pages/dashboard.html'
import SubmitButton from '../components/SubmitButton'
import InputName from '../components/InputName'
import InputAge from '../components/InputAge'
import Navigation from '../components/Navigation'

export default {
  template: DashboardPage,
  components: {
    Navigation: Navigation,
    SubmitButton: SubmitButton,
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
      }]
    },
  },
  methods: {
    testing() {
      this.testing2()
    },
    testing2() {
      console.log(this.pageName)
    }
  },
  mount() {
    this.testing()
    console.log(this.pageName)
  }
}
