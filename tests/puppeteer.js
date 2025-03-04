const puppeteer = require("puppeteer");
require("../app");
const { seed_db, testUserPassword } = require("../util/seed_db");
const Job = require("../models/Job");

let testUser = null;

let page = null;
let browser = null;
// Launch the browser and open a new blank page
describe("jobs-ejs puppeteer test", function () {
  before(async function () {
    this.timeout(10000);
    //await sleeper(5000)
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto("http://localhost:3000");
  });
  after(async function () {
    this.timeout(5000);
    await browser.close();
  });
  describe("got to site", function () {
    it("should have completed a connection", async function () { });
  });
  describe("index page test", function () {
    this.timeout(10000);
    it("finds the index page logon link", async () => {
      this.logonLink = await page.waitForSelector(
        "a ::-p-text(Click this link to logon)",
      );
    });
    it("gets to the logon page", async () => {
      await this.logonLink.click();
      await page.waitForNavigation();
      const email = await page.waitForSelector('input[name="email"]');
    });
  });
  describe("logon page test", function () {
    this.timeout(20000);
    it("resolves all the fields", async () => {
      this.email = await page.waitForSelector('input[name="email"]');
      this.password = await page.waitForSelector('input[name="password"]');
      this.submit = await page.waitForSelector("button ::-p-text(Logon)");
    });
    it("sends the logon", async () => {
      testUser = await seed_db();
      await this.email.type(testUser.email);
      await this.password.type(testUserPassword);
      await this.submit.click();
      await page.waitForNavigation();
      await page.waitForSelector(`p ::-p-text(${testUser.name} is logged on.)`);
      await page.waitForSelector("a ::-p-text(change the secret)");
      await page.waitForSelector('a[href="/secretWord"]');
      const copyr = await page.waitForSelector("p ::-p-text(copyright)");
      const copyrText = await copyr.evaluate((el) => el.textContent);
      console.log("copyright text: ", copyrText);
    });
  });
  describe("puppeteer job operations", function () {
    this.timeout(40000);

    it("clicks on link and verifies job list", async () => {
      const { expect } = await import('chai');
      this.jobsLink = await page.waitForSelector(
        "a ::-p-text(Click this link to view your jobs list.)",
      );
      await this.jobsLink.click();
      await page.waitForNavigation();

      const content = await page.content();
      const jobs = content.split('<tr>').length - 1;
      expect(jobs).to.equal(20, "Expected 20 job entries.");
    });

    it("should open the add job form and validate", async () => {
      const { expect } = await import('chai');
      const newJobLink = await page.waitForSelector('a[href="/jobs/new"]');
      await newJobLink.click();
      await page.waitForNavigation();

      const companyField = await page.waitForSelector('input[name="company"]');
      const positionField = await page.waitForSelector('input[name="position"]');
      const statusField = await page.waitForSelector('select[name="status"]');
      const addButton = await page.waitForSelector('button[type="submit"]');

      expect(companyField).to.exist;
      expect(positionField).to.exist;
      expect(statusField).to.exist;
      expect(addButton).to.exist;

      const companyValue = await companyField.evaluate(el => el.value);
      const positionValue = await positionField.evaluate(el => el.value);
      const statusValue = await statusField.evaluate(el => el.value);

      expect(companyValue).to.equal('');
      expect(positionValue).to.equal('');
      expect(statusValue).to.equal('pending');

    });
    it("fill out the form and add job", async () => {
      const { expect } = await import('chai');

      const companyField = await page.waitForSelector('input[name="company"]',);
      const positionField = await page.waitForSelector('input[name="position"]');
      const statusField = await page.waitForSelector('select[name="status"]');
      const addButton = await page.waitForSelector('button[type="submit"]');

      const companyName = "Company";
      const positionName = "Position";
      const statusName = "interview";

      await companyField.type(companyName);
      await positionField.type(positionName);
      await statusField.type(statusName);

      await addButton.click();
      await page.waitForNavigation();

      const lastJob = await Job.findOne({}).sort({ createdAt: -1 }).exec();
      expect(lastJob).to.exist;
      expect(lastJob.company).to.equal(companyName);
      expect(lastJob.position).to.equal(positionName);
      expect(lastJob.status).to.equal(statusName);

    });
  });

});