update auditor_profileinfo set city = 'Bangalore' where city in ('Bangalore', 'bangalore','BANGALORE','Banglore','Bangalore``', 'banglore', 'Bangaluru', 'Bengaluru');
update auditor_profileinfo set city = 'Delhi' where city in ('New-delhi', 'delhi ncr','New  Delhi','DELHI','delhi', 'Delhi');
update auditor_profileinfo set city = 'Noida' where city in ('greater noida', 'Greater Noida','noida','NOIDA','Noida');
