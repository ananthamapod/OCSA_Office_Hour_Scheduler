# OCSA Office Hours Scheduler

## A scheduling application built for use by the Off-Campus Students' Association

Each officer on the OCSA board is required to serve office hours manning the front desk in the office. The challenge for scheduling these required office hours is to work around each officer's availability and still have each serve their required hours, as well as make sure that each hour that the office is open is staffed.

This is a scheduler application that allows each officer to provide their availability, and once all officers have been accounted for, a list of possible schedules is produced.

This application is built on the MEAN stack, a MongoDB backend for storing the users' information and the generated possible schedules, Express.js for the web server, AngularJS for client-side interactions, and Node.js for the backbone of the application.

The matching algorithm is described as follows, with the times T and people P modelled as a bipartite graph:
<blockquote>
	<pre>
		Let n <- floor(|T|/|P|)

		Let A be a list with all p in P, and B be an empty stack.

		new Queue()

		//enqueue new empty schedule to start off
		enqueue(new Schedule())

		while A still has p to be scheduled:
			k <- Queue.size
			if k = 0:
				//no possible matching
				break
			else:
				curr <- p in A with lowest number of edges

				for k times:
					oldM <- dequeue()
					tmp <- t in E(curr, t)

					- remove from tmp all t already in oldM

					possibilities <- empty list
					if tmp has more than N t:
						possibilities <- combination: choose N from t in tmp
					endif

					//if possibilities is empty, will not go through this loop
					for poss in possibilities:
						newM <- copy of oldM
						- add t in poss to newM as assigned to curr
						enqueue(newM)
					endfor
				endfor

				- remove curr from A
				- push curr onto B
			endif
		endwhile

		if Queue is empty:
			error: no possible schedule with current availabilities
		else:
			
		endif
	</pre>
</blockquote>