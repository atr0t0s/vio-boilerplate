import Nav from '../templates/components/Navigation.html'

export default {
  template: Nav,
  data: {
    home: "Home",
    dashboard: "Dashboard",
    homeLink: "#",
    dashboardLink: "#dashboard",
    pageName: "Homepage",
  },
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
