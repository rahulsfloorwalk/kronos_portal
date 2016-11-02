
## improvement suggestions

* implement ISO 3166 for countries as well as states. So that you can do away with primary keys in that case.
* make city in Auditor Profile info a primary key to City Model.
* implement proper redirect for / root on portal app
* prevent REST calls between different user types
* cannot add email from the admin panel, so Manager users can be created manually or via the `createsuperuser` Django command 
* registration/views.py line 93,94
  * get the email and domain from properties file
  * Put all messages(strings) in separate strings file

## Technical Debt

* split reducers for auditor and managers into separate files 
* split actions for auditor and managers into separate files 
* convert services to use python modules directly instead of having to create a new class instance each time.
