import DashboardPage from '../templates/pages/dashboard.html'
import SubmitButton from '../components/SubmitButton'
import InputName from '../components/InputName'
import InputAge from '../components/InputAge'
import Navigation from '../components/Navigation'

export default {
  id: "Dashboard",
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
    testingMethodCall: {
      event: "click",
      call: "testing",
    }
  },
  methods: {
    testing() {
      this.pageName = "Testing"
      this.age += 1
    },
    mount_test() {
      console.log("Mount has been called successfully.")
    }
  },
  mount() {
    this.mount_test()
  }
}
