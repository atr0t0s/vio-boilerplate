import DashboardTemplate from '../templates/pages/dashboard.html'
import SubmitButton from '../templates/components/SubmitButton.html'
import InputName from '../templates/components/InputName.html'
import InputAge from '../templates/components/InputAge.html'
import Nav from '../templates/components/Navigation.html'

export default {
  template: DashboardTemplate,
  components: {
    Navigation: Nav,
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
