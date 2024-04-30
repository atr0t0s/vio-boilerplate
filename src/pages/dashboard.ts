import DashboardTemplate from '../templates/dashboard.html'
import SubmitButton from '../components/SubmitButton.html'
import InputName from '../components/InputName.html'
import InputAge from '../components/InputAge.html'

const Dashboard = {
  template: DashboardTemplate,
  components: {
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
      }],
    },
  },
  methods: {
    test() {
      console.log("testing")
    }
  },
  mount: () => {
    Dashboard.methods.test()
  }
}

export default Dashboard
